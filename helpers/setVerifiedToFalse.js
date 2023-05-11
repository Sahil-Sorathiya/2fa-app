const Domain = require("../models/domain");

exports.setVerifiedToFalse = async (clientid, domainname, domainData) => {
  const verifiedInDatabase = domainData.verified;
  if (verifiedInDatabase) {
    //: domain "verified" status in database is true and
    //: here verification failed that means either owner of domain is changed or txt record deleted,
    //: set verification status in DB from true to false
    const acknowledged = await Domain.updateOne(
      { client: clientid, domainname: domainname },
      {
        $set: {
          verified: false,
        },
      }
    );
    if (acknowledged.modifiedCount == 0) {
      return res.status(400).json({
        error: true,
        errorMessage: "Verification status not updated to false in Database",
      });
    }
  }
  return;
};
