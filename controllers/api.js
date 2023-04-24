const moment = require("moment");
const { v4: uuidv4 } = require("uuid");
const Client = require("../models/client");

exports.getApiKey = async (req, res) => {
  //! # Private Route
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
        clientname: client.clientname,
      });
    }
    const generatedAt = moment(client.apiUpdatedAt).format(
      "dddd, MMMM Do YYYY"
    );
    //: if(API-key found) send success message with "apiKey" & "generatedAt" & "clientname" with its value
    return res.status(200).json({
      error: false,
      successMessage: "API-key sent successfully",
      apiKey: client.api,
      generatedAt: generatedAt,
      clientname: client.clientname,
    });
  } catch (error) {
    return res.status(400).json({
      error: true,
      errorMessage: error.message,
    });
  }
};

exports.generateApiKey = async (req, res) => {
  //! # Private Route
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
  //! # Private Route
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
