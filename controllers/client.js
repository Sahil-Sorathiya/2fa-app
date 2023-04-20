const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const moment = require('moment');
const { v4: uuidv4 } = require("uuid");
const { sendMail } = require("../helpers/nodemailer");
const Client = require("../models/client");

exports.register = async (req, res) => {
  /**
   *: First check that client is already regitered or not
   *: if (already registered) send error
   *: if (!already registered) {
   *:   hash password with bcrypt
   *:   generate JWT token with all client data
   *:   send verification mail to given email id and send success message
   *: }
   */

  const { clientname, email, password } = req.body;
  const saltRounds = 10;
  try {
    //: First check that client is already regitered or nott
    const clientDataTemp = await Client.findOne({ email });

    //: if (already registered) send error
    if (clientDataTemp) {
      return res.status(400).json({
        error: true,
        errorMessage: "Email already exist. Go for login.",
      });
    }

    //: if (not already registered) {
    const hash = await bcrypt.hash(password, saltRounds);
    //: hash password with bcrypt
    const token = await jwt.sign(
      {
        uid: uuidv4(),
        clientname,
        password: hash,
        email,
      },
      process.env.JWTSECRET,
      { expiresIn: 60 * 60 } // 1 hour
    );
    //: generate JWT token with all client data
    const verificationUrl = `${process.env.PROTOCOL}://${process.env.DOMAINNAME}/client/verify/${token}`;
    //: send verification mail to given email id and send success message
    const maildata =
      process.env.SENDMAIL === "true"
        ? await sendMail(email, verificationUrl)
        : `Hello I'm maildata ${(email, verificationUrl)}`;
    return res.status(200).json({
      error: false,
      successMessage:
        "Verification mail sent successfully to given email address",
      verificationUrl,
      maildata,
    });
    // TODO before final production remove verificationUrl and maildata fields from response
  } catch (error) {
    return res.status(400).json({
      error: true,
      errorMessage: error.message,
    });
  }
};

exports.verify = async (req, res) => {
  /**
   *: First check that client is already verified or not
   *: if(alredy verified) send error
   *: if(!alredy verified) save client data to DB and send success message
   */

  const { token } = req.params;
  try {
    const decodedData = await jwt.verify(token, process.env.JWTSECRET);
    const { uid, clientname, password, email } = decodedData;

    //: Checking that user is already verified or not
    const clientDataTemp = await Client.findOne({ email });

    //: if (already verified)
    if (clientDataTemp) {
      return res.status(400).send("Email already Verified. Go for Login.");
    }

    //: if (not already verified)
    const clientData = new Client({ uid, clientname, email, password });
    const savedClientData = await clientData.save();
    if (savedClientData) {
      return res.status(200).send("Email verified successfully. Go for Login.");
    }
  } catch (error) {
    //: here error will shown directly on client side. so no need to send entire
    //: object like {
    //:   error: true,
    //:   errorMessage: "something"
    //: }
    let errorMessage = "Some error occured";
    if (error.name === "TokenExpiredError") {
      errorMessage = "Token is Expired";
    }

    if (error.name === "JsonWebTokenError") {
      errorMessage = error.message;
    }
    return res.status(400).send(errorMessage);
  }
};

exports.login = async (req, res) => {
  /**
   *: Fetch Client data from DB using email given in req body
   *: if(no client found) return error that user not found
   *: if(client found) {
   *:    match password in given req body with Client password in DB
   *:    if(password is not matched) return error that incorrect password
   *:    if(password matched) generate login jwt token and send it as res with success message
   *: }
   */
  const { email, password } = req.body;
  try {
    //: Fetch Client data from DB using email given in req body
    const clientData = await Client.findOne({ email });

    //: if(no client found) return error that user not found
    if (!clientData) {
      return res.status(400).json({
        error: true,
        errorMessage: "User not Found",
      });
    }
    //: if(client found) {
    //: match password in given req body with Client password in DB
    const isPasswordMatch = await bcrypt.compare(password, clientData.password);

    //: if(password is not matched) return error that incorrect password
    if (!isPasswordMatch) {
      return res.status(401).json({
        error: true,
        errorMessage: "Password is incorrect",
      });
    }

    //: if(password matched) generate login jwt token and send it as res with success message
    const token = jwt.sign(clientData.toJSON(), process.env.JWTSECRET, {
      expiresIn: 60 * 60 * 12,
    }); // 12 Hours
    return res.status(200).json({
      error: false,
      successMessage: "Login Successfully",
      token: token,
      clientid: clientData._id,
    });
  } catch (error) {
    return res.status(400).json({
      error: true,
      errorMessage: error.message,
    });
  }
};

exports.secureRoute = (req, res) => {
  return res.send("this is secure route");
};

exports.privateRoute = (req, res) => {
  return res.send("This is private route");
};

exports.dashboard = async (req, res) => {
  //! # Private Route
  /**
   *: extract clientid from req.clientData set by isAuthenticated middleware
   *: fetch all latest details of that user from database
   *: set password, api & apiUpdatedAt field undefined
   *: send success message with whole client's data
   */

  try {
    //: extract clientid from req.clientData set by isAuthenticated middleware
    const clientid = req.clientData._id;
    //: fetch all latest details of that user from database
    const client = await Client.findOne({ _id: clientid });
    //: set password, api & apiUpdatedAt field undefined
    client.password = undefined;
    client.api = undefined;
    client.apiUpdatedAt = undefined;
    //: send success message with whole client's data
    return res.status(200).json({
      error: false,
      successMessage: "User found and data has been sent",
      clientData: client,
    });
  } catch (error) {
    return res.status(400).json({
      error: true,
      errorMessage: error.message,
    });
  }
};

exports.saveDomainAndGenerateTxt = async (req, res) => {
  //? # Private Route
  /**
   *: First fetch domain name form req body
   *: Then take clientId from req.clientData object which is set in isAuthenticated middleware
   *: Check that client exist or not
   *: if(Client not exist) send error
   *: if(Client exist) {
   *:   Check that domain is already saved or not
   *:   if(Domian already saved) send error
   *:   if(Domain not already saved) {
   *:     generate uuid
   *:     update the domain with uuid in db
   *:     if(not updated) send error
   *:     if(updated) send success message with TXT record
   *: }
   */

  //: First fetch domain name form req body
  const domainname = req.body.domainname;
  //: Then take clientId from req.clientData object which is set in isAuthenticated middleware
  const clientId = req.clientData._id;

  try {
    //: Check that client exist or not
    const clientData = await Client.findOne({ _id: clientId });

    //: if(Client not exist) send error
    if (!clientData) {
      return res.status(400).json({
        error: true,
        errorMessage: "Client not exist",
      });
    }
    //: if(Client exist) {
    //: Check that domain is already saved or not
    for (let i = 0; i < clientData.domains.length; i++) {
      const domain = clientData.domains[i];
      //: if(Domian already saved) send error
      if (domain.domainname === domainname) {
        return res.status(400).json({
          error: true,
          errorMessage: "Domain already added",
        });
      }
    }
    //: if(Domain not already saved) {
    //: generate uuid
    const uuid = uuidv4();

    //: update the domain with uuid in db
    const dbResponse = await Client.updateOne(
      { _id: clientId },
      { $push: { domains: { domainname: domainname, txt: uuid } } }
    );

    //: if(not updated) send error
    if (dbResponse.modifiedCount == 0) {
      return res.status(400).json({
        error: true,
        successMessage: "Domain not updated in DB",
      });
    }
    //: if(updated) send success message with TXT record
    return res.status(200).json({
      error: false,
      successMessage: "Domain saved Successfully.",
      txt: "2fa-verification=" + uuid,
    });
  } catch (error) {
    return res.status(400).json({
      error: true,
      errorMessage: error.message,
    });
  }
};

exports.verifyTxt = async (req, res) => {
  //? # Private Route
  /**
   *: extract clientid from req.clientData set by isAuthenticated middleware
   *: extract domain from body
   *: update verified field of that domain in database
   *: if(!updated) send error message
   *: if(updated) send success message
   */

  //: extract clientid from req.clientData set by isAuthenticated middleware
  const clientid = req.clientData._id;
  //: extract domain from body
  const domainname = req.body.domainname;
  //: update verified field of that domain in database
  const acknowledged = await Client.updateOne(
    { _id: clientid, "domains.domainname": domainname },
    {
      $set: {
        "domains.$.verified": true,
      },
    }
  );
  //: if(!updated) send error message
  if (acknowledged.modifiedCount == 0) {
    return res.status(400).json({
      error: true,
      errorMessage: "Verification status not updated in Database",
    });
  }
  //: if(updated) send success message
  return res.status(200).json({
    error: false,
    successMessage: "Domain verified successfully",
  });
};

exports.getApiKey = async (req, res) => {
  /**
   *: extract clientid from req.clientData set by isAuthenticated middleware
   *: fetch all latest details of that user from database
   *: if(no API-key found) send success message with "apiKey" & "generatedAt" & "clientname" as null
   *: if(API-key found) send success message with "apiKey" & "generatedAt" & "clientname" with its value
   */
  try {
    //: extract clientid from req.clientData set by isAuthenticated middleware
    const clientid = req.clientData._id;
    //: fetch all latest details of that user from database
    const client = await Client.findOne({ _id: clientid });
    //: if(no API-key found) send success message with "apiKey" & "generatedAt" & "clientname" as null
    if (!client.api) {
      return res.status(200).json({
        error: false,
        successMessage: "No API-key exist in database",
        apiKey: null,
        generatedAt: null,
        clientname: client.clientname
      });
    }
    const generatedAt = moment(client.apiUpdatedAt).format("dddd, MMMM Do YYYY");;
    //: if(API-key found) send success message with "apiKey" & "generatedAt" & "clientname" with its value
    return res.status(200).json({
      error: false,
      successMessage: "API-key sent successfully",
      apiKey: client.api,
      generatedAt: generatedAt,
      clientname: client.clientname
    })

  } catch (error) {
    return res.status(400).json({
      error: true,
      errorMessage: error.message,
    });
  }
};

exports.generateApiKey = async (req, res) => {
  /**
   *: extract clientid from req.clientData set by isAuthenticated middleware
   *: fetch all latest details of that user from database
   *: if(API-key already generated) send error that only one api at a time
   *: if(API-key not already generated) {
   *:   generate API-key using uuid and save time when that API-key generated
   *:   update value of "api" & "apiUpdatedAt" fields in database
   *:   if(API-key not updated) send error that API-key not updated in DB
   *:   if(API-key updated) send success message with that API-key & generatedAt values
   *: }
   */

  try {
    //: extract clientid from req.clientData set by isAuthenticated middleware
    const clientid = req.clientData._id;
    //: fetch all latest details of that user from database
    const client = await Client.findOne({ _id: clientid });
    //: if(API-key already generated) send error that only one api at a time
    if (client.api) {
      return res.status(400).json({
        error: true,
        errorMessage:
          "Client must have only one API-key at a time. Please delete the API-key and then generate new API-key",
      });
    }
    //: if(API-key not already generated) {
    //: generate API-key using uuid and save time when that API-key generated
    const apiKey = uuidv4();
    const generatedAt = new Date();
    //: update value of "api" & "apiUpdatedAt" fields in database
    const dbResponse = await Client.updateOne(
      { _id: req.clientData._id },
      {
        $set: {
          api: apiKey,
          apiUpdatedAt: generatedAt,
        },
      }
    );
    //: if(API-key not updated) send error that API-key not updated in DB
    if (dbResponse.acknowledged == 0) {
      return res.status(400).json({
        error: true,
        errorMessage: "API-key not updated in Database",
      });
    }
    //: if(API-key updated) send success message with that API-key & generatedAt values
    return res.status(200).json({
      error: false,
      successMessage: "API-key generated successfully",
      apiKey: apiKey,
      generatedAt: generatedAt,
    });
  } catch (error) {
    return res.status(400).json({
      error: true,
      errorMessage: error.message,
    });
  }
};

exports.deleteApiKey = async (req, res) => {
  /**
   *: extract clientid from req.clientData set by isAuthenticated middleware
   *: fetch all latest details of that user from database
   *: if("api" & "apiUpdatedAt" fields are null or undefined) send error that  no API-key exists in Database
   *: if("api" & "apiUpdatedAt" fields exist) {
   *:   set & update value of "api" & "apiUpdatedAt" fields to "null" in database
   *:   if(API-key not update) send error that API-key not deleted in DB
   *:   if(API-key updated) send success message that API-key deleted
   *: }
   */
  try {
    //: extract clientid from req.clientData set by isAuthenticated middleware
    const clientid = req.clientData._id;
    //: fetch all latest details of that user from database
    const client = await Client.findOne({ _id: clientid });
    //: if("api" & "apiUpdatedAt" fields are null or undefined) send error that no API-key exists in Database
    if (!client.api && !client.apiUpdatedAt) {
      return res.status(400).json({
        error: true,
        errorMessage: "No API-key exists in database",
      });
    }
    //: if("api" & "apiUpdatedAt" fields exist) {
    //: set & update value of "api" & "apiUpdatedAt" fields to "null" in database
    const dbResponse = await Client.updateOne(
      { _id: req.clientData._id },
      {
        $set: {
          api: null,
          apiUpdatedAt: null,
        },
      }
    );

    //: if(API-key not update) send error that API-key not deleted in DB
    if (dbResponse.acknowledged == 0) {
      return res.status(400).json({
        error: true,
        errorMessage: "API-key not deleted in Database",
      });
    }

    //: if(API-key updated) send success message that API-key deleted
    return res.status(200).json({
      error: false,
      successMessage: "API-key deleted successfully",
    });
  } catch (error) {
    return res.status(400).json({
      error: true,
      errorMessage: error.message,
    });
  }
};
