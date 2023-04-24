const jwt = require("jsonwebtoken");

exports.isAuthenticated = async (req, res, next) => {
  const bearerToken = req.headers["authorization"];
  const token = bearerToken?.split(" ")[1];

  if (!bearerToken || !token) {
    return res.status(401).json({
      error: true,
      errorMessage: "User is not authenticated",
    });
  }
  try {
    //: Verifying JWT token, if any error occured 'catch()' will directly handle it
    const decodedData = await jwt.verify(token, process.env.JWTSECRET);
    //: Set client's whole data as req.clientData 
    //! But it is not client's latest data
    //! it is a data of client stored in JWT token while loging in
    req.clientData = decodedData;

  } catch (error) {
    let errorMessage = "Some error occured";

    if (error.name === "TokenExpiredError") {
      errorMessage = "Token is Expired";
    }

    if (error.name === "JsonWebTokenError") {
      errorMessage = error.message;
    }
    // console.log(error);
    return res.status(400).json({
      error: true,
      errorMessage: errorMessage
    });
  }

  return next();
};
