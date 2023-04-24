const dns = require('node:dns');
const dnsPromises = dns.promises;
const Client = require("../models/client");
const Domain = require("../models/domain");

exports.verifyTxtRecord = async (req, res, next) => {
  //: extract clientid from req.clientData set by isAuthenticated or verifyApiKey middleware
  //: fetch all latest details of that user from database
  //: iterate domains array and check that domain given in req.body is saved in database or not
  //: if (domain found) {
  //:   set isDomainSaved to true and save "txt record" & "verified" value from db to variables for letter use
  //:   make dns lookup reqeust
  //:   filter TXT records which starts with "2fa-verification"
  //:   if (no TXT record left after filtering) send error that no txt verification record found
  //:   if (TXT record(s) left after filtering) {
  //:     fetch uuid from TXT and compare it with txt verification uuid saved in DB
  //:     if (both uuid matched) call next()
  //:     if (both uuid not matched){
  //:       send error message that verification is unsuccessfull
  //:       if domain "verified" status in database is already true change it to false in DB
  //:     }
  //:   }
  //: }
  //: if(domain not found) send error that domain is not saved in DB

  try {
    //: extract domainname from req.body which is validated by "validateDomain" middleware
    const { domainname } = req.body;
    //: extract clientid from req.clientData set by isAuthenticated or verifyApiKey middleware
    const clientid = req.clientData._id;
    //: fetch all latest details of that user from database
    const client = await Client.findOne({ _id: clientid });
    //: if client not exist send error
    if (!client) {
      return res.status(400).json({
        error: true,
        errorMessage: "Client not exist in Database",
      });
    }
    req.clientData = client
    //: check that domain exist or not (using clientid & domainname combination)
    const domainData = await Domain.findOne({
      client: clientid,
      domainname: domainname,
    });

    //: if (domain found)
    if (domainData) {
      req.domainData = domainData;
      //: make dns lookup reqeust
      const response = await dnsPromises.resolveTxt(domainData.domainname)

      //: filter TXT records which starts with "2fa-verification"
      const txtRecords = response.filter((record) => {
        return (
          record[0].startsWith("2fa-verification")
        );
      });
      //: if (no TXT record left after filtering) send error that no txt verification record found
      if (txtRecords.length == 0) {
        return res.status(400).json({
          error: true,
          errorMessage:
            "It may take a while to propagate the TXT record. Please wait upto 24 hrs after updating TXT record",
        });
      }
      //: if (more than one TXT records left after filtering)
      if (txtRecords.length > 1) {
        return res.status(400).json({
          error: true,
          errorMessage:
            "More than one txt records found which starts with '2fa-verification' on your DNS Lookup",
        });
      }
      //: if (only one TXT record left after filtering)
      //: fetch uuid from TXT and compare it with txt verification uuid saved in DB
      const txtUuid = txtRecords[0][0].split("=")[1];
      //: if (both uuid matched) call next()
      const txtInDatabase = domainData.txt;
      if (txtInDatabase === txtUuid) {
        return next();
      }
      //: if (both uuid not matched) send error message that verification is unsuccessfull
      else {
        const verifiedInDatabase = domainData.verified;
        if (verifiedInDatabase) {
          //: domain "verified" status in database is true and
          //: here verification failed that means either owner of domain is changed or txt record deleted,

          //TODO in this case what we can do?

          //: as of now I changed the verification status from true to false
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
              errorMessage: "Verification status not updated in Database",
            });
          }
        }
        return res.status(400).json({
          error: true,
          errorMessage:
            "Domain verification falied. Please verify your domain again.",
        });
      }
    }

    //: if (domain not found) send error
    if (!domainData) {
      return res.status(400).json({
        error: true,
        errorMessage: "Domain you want to verify is not saved in our database",
      });
    }
  } catch (error) {
    return res.status(400).json({
      error: true,
      errorMessage: error.message,
    });
  }
};
