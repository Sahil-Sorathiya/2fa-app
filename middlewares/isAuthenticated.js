const jwt = require("jsonwebtoken");

exports.isAuthenticated = async (req, res, next) => {
  const bearerToken = req.headers["authorization"];
  const token = bearerToken?.split(" ")[1];
  console.log(bearerToken);
  console.log(token);
  if (!bearerToken || !token) {
    return res.status(401).json({
      error: true,
      errorMessage: "User is not authenticated",
    });
  }
  try {
    const decodedData = await jwt.verify(token, process.env.JWTSECRET);

    req.clientData = decodedData;
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
    // console.log(error);
    return res.status(400).json({
      error: true,
      errorMessage: errorMessage
    });
  }

  next();
};
