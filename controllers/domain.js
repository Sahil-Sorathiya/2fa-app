const { v4: uuidv4 } = require("uuid");
const Client = require("../models/client");
const Domain = require("../models/domain");

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
        errorMessage: "Client not exist in Database",
      });
    }
    //: if(Client exist) {
    //: Check that domain is already saved or not
    const domainData = await Domain.findOne({ client:clientData._id, domainname:domainname });
    //: if(Domian already saved) send error
    if (domainData) {
      return res.status(400).json({
        error: true,
        errorMessage: "Domain already added",
      });
    }
    //: if(Domain not already saved) {
    //: generate uuid
    const uuid = uuidv4();

    //: update the domain with uuid in db
    const domainObj = new Domain({
      domainname: domainname,
      txt: uuid,
      client: clientData._id,
    });
    const dbResponse = await domainObj.save();

    //: if(not updated) send error
    if (!dbResponse) {
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
  const acknowledged = await Domain.updateOne(
    { client: clientid, domainname: domainname },
    {
      $set: {
        verified: true,
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
