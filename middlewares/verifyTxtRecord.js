const axios = require("axios");
const Client = require("../models/client");

exports.verifyTxtRecord = async (req, res, next) => {
  //: extract clientid from req.clientData set by isAuthenticated middleware
  //: fetch all latest details of that user from database
  //: iterate domains array and check that domain given in req.body is saved in database or not
  //: if (domain found) {
        //: set isDomainSaved to true and save "txt record" & "verified" value from db to variables for letter use
        //: make dns lookup reqeust
        //: filter TXT records which starts with "2fa-verification"
        //: if (no TXT record left after filtering) send error that no txt verification record found
        //: if (TXT record(s) left after filtering) {
             //: fetch uuid from TXT and compare it with txt verification uuid saved in DB
             //: if (both uuid matched) call next()
             //: if (both uuid not matched){
                  //: send error message that verification is unsuccessfull
                  //: if domain "verified" status in database is already true change it to false in DB

             //: }
        //: }
  //: }
  //: if(domain not found) send error that domain is not saved in DB
  try {
    const { domainname } = req.body;
    //: extract clientid from req.clientData set by isAuthenticated middleware
    const clientid = req.clientData._id;
    //: fetch all latest details of that user from database
    const client = await Client.findOne({ _id: clientid });
    //: flag
    var isDomainSaved = false;
    var txtInDatabase = "";
    var verifiedInDatabase = false;
    //: iterate domains array and check that domain given in req.body is saved in database or not
    for (let index = 0; index < client.domains.length; index++) {
      const item = client.domains[index];
      if (item.domainname === domainname) {
        //: if (domain found) set isDomainSaved to true and save "txt record" & "verified" value from db to variables for letter use
        isDomainSaved = true;
        txtInDatabase = item.txt;
        verifiedInDatabase = item.verified;
      }
    }

    //: if (domain found)
    if (isDomainSaved) {
      //: make dns lookup reqeust
      const options = {
        method: "GET",
        url: "https://dns-lookup-by-api-ninjas.p.rapidapi.com/v1/dnslookup",
        params: { domain: domainname },
        headers: {
          "X-RapidAPI-Key": process.env.RAPIDAPIKEY,
          "X-RapidAPI-Host": "dns-lookup-by-api-ninjas.p.rapidapi.com",
        },
      };
      const response = await axios.request(options);

      //: filter TXT records which starts with "2fa-verification"
      const txtRecords = response.data.filter((record) => {
        return (
          record.record_type === "TXT" &&
          record.value.startsWith("2fa-verification")
        );
      });

      //: if (no TXT record left after filtering) send error that no txt verification record found
      if (!txtRecords.length) {
        return res.status(400).json({
          error: true,
          errorMessage: "No TXT verification record found",
        });
      }
      //: if (TXT record(s) left after filtering)
      //: fetch uuid from TXT and compare it with txt verification uuid saved in DB
      txtRecords.forEach(async(txtRecord) => {
        const txtUuid = txtRecord.value.split("=")[1];
        //: if (both uuid matched) call next()
        if (txtInDatabase === txtUuid) {
          return next();
        } 
        //: if (both uuid not matched) send error message that verification is unsuccessfull
        else {
          if(verifiedInDatabase){
            //: domain "verified" status in database is true and
            //: here verification failed that means either owner of domain is changed or txt record deleted,
            
            //TODO in this case what we can do?

            //: as of now I changed the verification status from true to false
            try {
              const acknowledged = await Client.updateOne(
                {_id: clientid, "domains.domainname": domainname},
                {
                  $set: {
                    "domains.$.verified": false,
                  }
                }
              )
            
              if (acknowledged.modifiedCount == 0) {
                return res.status(400).json({
                  error: true,
                  errorMessage: "Verification status not updated in Database",
                });
              }
            } catch (error) {
              return res.status(400).json({
                error: true,
                errorMessage: error.message,
              });
            }
          }
          return res.status(400).json({
            error: true,
            errorMessage: "It will take a while to propagate the TXT record. Please wait upto 24hrs after updating TXT record",
          });
        }
      });
    }

    //: if (domain not found) send error
    if (!isDomainSaved) {
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

