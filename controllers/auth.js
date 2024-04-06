const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
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
    //: hash password with bcrypt
    const hash = await bcrypt.hash(password, saltRounds);
    //: generate JWT token with all client data
    const token = jwt.sign(
      {
        uid: uuidv4(),
        clientname,
        password: hash,
        email,
      },
      process.env.JWTSECRET,
      { expiresIn: 60 * 60 } // 1 hour
    );
    //: send verification mail to given email id and send success message
    const verificationUrl = `${process.env.PROTOCOL}://${process.env.DOMAINNAME}/auth/verify/register/${token}`;
    const maildata =
      process.env.SENDMAIL === "true"
        ? await sendMail(email, {
          isRegister: true,
          verificationUrl: verificationUrl
        })
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
}

exports.verifyRegister = async (req, res) => {
  /**
   *: First check that client is already verified or not
   *: if(alredy verified) send error
   *: if(!alredy verified) save client data to DB and send success message
   */

  try {
    const { token } = req.params;
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
}

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
}

exports.forgotPassword = async (req, res) => {
  /**
   *: if (not already registered) {
   *:   hash password with bcrypt
   *:   generate JWT token with all client data
   *:   send verification mail to given email id and send success message
   *: }
   */
  try {
    const {email, password} = req.body;
    const clientData = await Client.findOne({email: email})
    if(!clientData) {
      return res.status(400).json({
        error: true,
        errorMessage: "Email not registered on our site"
      })
    }
    //: if (not already registered) {
    //: hash password with bcrypt
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    const token = jwt.sign(
      { email, password: hash },
      process.env.JWTSECRET,
      { expiresIn: 10 * 60 } // 10 minutes
    );
    //: generate JWT token with all client data
    const verificationUrl = `${process.env.PROTOCOL}://${process.env.DOMAINNAME}/auth/verify/forgotpassword/${token}`;
    //: send verification mail to given email id and send success message
    const maildata =
      process.env.SENDMAIL === "true"
        ? await sendMail(email, {
          isForgotPassword: true,
          verificationUrl: verificationUrl
        })
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
}

exports.verifyForgotPassword = async (req, res) => {
  /**
   *: First check that client is already verified or not
   *: if(alredy verified) send error
   *: if(!alredy verified) save client data to DB and send success message
   */

   try {
    const { token } = req.params;
    const decodedData = await jwt.verify(token, process.env.JWTSECRET);
    const { password, email } = decodedData;

    //: Checking that user is already verified or not
    const dbResponse = await Client.findOneAndUpdate({ email },{
      $set: {
        "password": password
      }
    });

    //: if (not already verified)
    if (dbResponse.acknowledged == 0) {
      return res.status(400).send("Password not updated in Database");
    }

    return res.status(200).send("Password changed Successfully")
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
}

exports.changePassword = async (req, res) => {
  try {
    const clientid = req.clientData._id;
    const { currentPassword, newPassword } = req.body;
    //: hash password with bcrypt
    const client = await Client.findOne({ _id: clientid });
    if (!client) {
      return res.status(400).json({
        error: true,
        errorMessage: "User not exist in our Database",
      });
    }
    const isPasswordMatch = await bcrypt.compare(
      currentPassword,
      client.password
    );
    if (!isPasswordMatch) {
      return res.status(400).json({
        error: true,
        errorMessage: "Current password is incorrect",
      });
    }
    const saltRounds = 10;
    const hash = await bcrypt.hash(newPassword, saltRounds);
    const dbResponse = await Client.findOneAndUpdate(
      { _id: clientid },
      {
        $set: {
          password: hash,
        },
      }
    );

    //: if (not already verified)
    if (dbResponse.acknowledged == 0) {
      return res.status(400).json({
        error: true,
        errorMessage: "Password not updated in Database"
      });
    }

    return res.status(200).json({
      error: false,
      successMessage: "Password changed Successfully"
    });
  } catch (error) {
    return res.status(400).json({
      error: true,
      errorMessage: error.message,
    });
  }
}