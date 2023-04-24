const validator = require("validator");

exports.validateRegister = (req, res, next) => {
  if (!req.body) {
    return res.status(400).json({
      error: true,
      errorMessage: "Request body not found",
    });
  }
  if (!req.body.email || !req.body.password || !req.body.clientname) {
    return res.status(400).json({
      error: true,
      errorMessage: "Required parameters are not there",
    });
  }

  const { clientname, email, password } = req.body;

  if (typeof clientname !== "string") {
    return res.status(400).json({
      error: true,
      errorMessage: "Client Name is not a string",
    });
  }
  if (typeof email !== "string") {
    return res.status(400).json({
      error: true,
      errorMessage: "Email is not a string",
    });
  }
  if (typeof password !== "string") {
    return res.status(400).json({
      error: true,
      errorMessage: "Password is not a string",
    });
  }

  if (clientname.length > 64) {
    return res.status(400).json({
      error: true,
      errorMessage: "Client Name must not contain more than 64 characters",
    });
  }

  const isEmail = validator.isEmail(email);
  if (!isEmail) {
    return res.status(400).json({
      error: true,
      errorMessage: "Email is invalid",
    });
  }

  if (password.length > 32) {
    return res.status(400).json({
      error: true,
      errorMessage: "Password must not contain more than 20 characters",
    });
  }

  if(!validator.isStrongPassword(password)){
    return res.status(400).json({
      error: true,
      errorMessage: "Password must contain atleast 8 characters, one Capital letter, one small letter, one special character and one numaric value."
    })
  }
  next();
};

exports.validateLogin = (req, res, next) => {
  if (!req.body) {
    return res.status(400).json({
      error: true,
      errorMessage: "Request body not found",
    });
  }
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({
      error: true,
      errorMessage: "Required parameters are not there",
    });
  }

  const { email, password } = req.body;

  if (typeof email !== "string") {
    return res.status(400).json({
      error: true,
      errorMessage: "Email is not a string",
    });
  }
  if (typeof password !== "string") {
    return res.status(400).json({
      error: true,
      errorMessage: "Password is not a string",
    });
  }

  const isEmail = validator.isEmail(email);
  if (!isEmail) {
    return res.status(400).json({
      error: true,
      errorMessage: "Email is invalid",
    });
  }
  next();
};

exports.validateDomain = (req, res, next) => {
  if (!req.body) {
    return res.status(400).json({
      error: true,
      errorMessage: "Request body not found",
    });
  }

  if (!req.body.domainname) {
    return res.status(400).json({
      error: true,
      errorMessage: "Required parameters are not there (domainname)",
    });
  }

  const { domainname } = req.body;

  if (typeof domainname !== "string") {
    return res.status(400).json({
      error: true,
      errorMessage: "Domain is not a string",
    });
  }

  const isDomain = validator.isFQDN(domainname);

  if (!isDomain) {
    return res.status(400).json({
      error: true,
      errorMessage: "Domain is not valid",
    });
  }

  return next();
};

exports.validateSendOtp = async (req, res, next) => {
  if (!req.body) {
    return res.status(400).json({
      error: true,
      errorMessage: "Request body not found",
    });
  }
  console.log(req.body)
  if (!req.body.clientApiKey || !req.body.emailOfUser || !req.body.domainname || !req.body.redirectUrl) {
    return res.status(400).json({
      error: true,
      errorMessage: "Required parameters are not there",
    });
  }

  const { clientApiKey, emailOfUser, domainname, redirectUrl } = req.body;

  if (typeof clientApiKey !== "string") {
    return res.status(400).json({
      error: true,
      errorMessage: "API-key is not a string",
    });
  }
  if (typeof emailOfUser !== "string") {
    return res.status(400).json({
      error: true,
      errorMessage: "'Email of User' is not a string",
    });
  }
  if (typeof domainname !== "string") {
    return res.status(400).json({
      error: true,
      errorMessage: "Domain name is not a string",
    });
  }
  if(typeof redirectUrl !== "string") {
    return res.status(400).json({
      error: true,
      errorMessage: "Redirection URL is not a string"
    })
  }

  const isEmail = validator.isEmail(emailOfUser);
  if (!isEmail) {
    return res.status(400).json({
      error: true,
      errorMessage: "'Email of User' is invalid",
    });
  }
  const isDomain = validator.isFQDN(domainname);
  if (!isDomain) {
    return res.status(400).json({
      error: true,
      errorMessage: "Domain is not valid",
    });
  }
  const isApiKey = validator.isUUID(clientApiKey)
  if (!isApiKey) {
    return res.status(400).json({
      error: true,
      errorMessage: "API-key malwared",
    });
  }
  const isUrl = validator.isURL(redirectUrl, {
    require_protocol: true
  })
  if(!isUrl) {
    return res.status(400).json({
      error: true,
      errorMessage: "Redirection URL is in incorrect format",
    });
  }

  return next();

}

exports.validateVerifyOtp = (req, res, next)=>{
  if (!req.body) {
    return res.status(400).json({
      error: true,
      errorMessage: "Request body not found",
    });
  }
  if (!req.body.uuid || !req.body.otpString) {
    return res.status(400).json({
      error: true,
      errorMessage: "Required parameters are not there",
    });
  }

  const { uuid, otpString,  } = req.body;

  if (typeof uuid !== "string") {
    return res.status(400).json({
      error: true,
      errorMessage: "Uuid is not a string",
    });
  }
  if (typeof otpString !== "string") {
    return res.status(400).json({
      error: true,
      errorMessage: "otp is not a string",
    });
  }

  const isOtp = validator.isInt(otpString, {min: 100000, max: 999999})
  if (!isOtp) {
    return res.status(400).json({
      error: true,
      errorMessage: "Otp is not valid",
    });
  }

  const isUuid = validator.isUUID(uuid)
  if (!isUuid) {
    return res.status(400).json({
      error: true,
      errorMessage: "Uuid malwared",
    });
  }

  return next();
}
