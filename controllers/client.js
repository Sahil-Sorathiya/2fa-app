const Client = require("../models/client");
const Domain = require("../models/domain");

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
    const domains = await Domain.find({client: clientid});
    //: set password, api & apiUpdatedAt field undefined
    client.password = undefined;
    client.api = undefined;
    client.apiUpdatedAt = undefined;
    //: send success message with whole client's data
    return res.status(200).json({
      error: false,
      successMessage: "User found and data has been sent",
      clientData: {...client._doc, domains},
    });
  } catch (error) {
    return res.status(400).json({
      error: true,
      errorMessage: error.message,
    });
  }
};
