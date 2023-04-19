const validator = require("validator");

exports.validateRegister = (req, res, next) => {
  // console.log("Validate register called");
  if (!req.body) {
    return res.status(400).json({
      error: true,
      errorMessage: "Request body not found",
    });
  }
  // console.log(req.body);
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

  // if (password.length < 7) {
  //   return res.status(400).json({
  //     error: true,
  //     errorMessage: "Password must contains atleast 8 characters",
  //   });
  // }
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
  // console.log("Validate register finished");
  next();
};

exports.validateLogin = (req, res, next) => {
  // console.log("Validate Login called");
  if (!req.body) {
    return res.status(400).json({
      error: true,
      errorMessage: "Request body not found",
    });
  }
  // console.log(req.body);
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
  // console.log("Validate register finished");
  next();
};

exports.validateDomain = (req, res, next) => {
  if (!req.body) {
    return res.status(400).json({
      error: true,
      errorMessage: "Request body not found",
    });
  }

  if (!req.body.domain) {
    return res.status(400).json({
      error: true,
      errorMessage: "Required parameters are not there",
    });
  }

  const { domain } = req.body;

  if (typeof domain !== "string") {
    return res.status(400).json({
      error: true,
      errorMessage: "Domain is not a string",
    });
  }

  const isDomain = validator.isFQDN(domain);

  if (!isDomain) {
    return res.status(400).json({
      error: true,
      errorMessage: "Domain is not valid",
    });
  }

  return next();
};
