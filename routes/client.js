const express = require("express");
const router = express.Router();

const {
  register,
  verify,
  login,
  secureRoute,
  privateRoute,
  dashboard,
  saveDomainAndGenerateTxt,
  verifyTxt,
  generateApiKey,
  deleteApiKey,
  getApiKey,
} = require("../controllers/client");
const {
  validateRegister,
  validateLogin,
  validateDomain,
} = require("../middlewares/client");
const { isAuthenticated } = require("../middlewares/isAuthenticated");
const { isAuthorized } = require("../middlewares/isAuthorized");
const { verifyTxtRecord } = require("../middlewares/verifyTxtRecord");

router.post("/register", validateRegister, register);

router.get("/verify/:token", verify);

router.post("/login", validateLogin, login);

router.get("/secure", isAuthenticated, secureRoute);

router.get("/private/:clientid", isAuthenticated, isAuthorized, privateRoute);

router.get("/dashboard/:clientid", isAuthenticated, isAuthorized, dashboard);

router.post("/savedomain/:clientid", isAuthenticated, isAuthorized, validateDomain, saveDomainAndGenerateTxt);

router.post("/verifytxt/:clientid",isAuthenticated, isAuthorized, validateDomain, verifyTxtRecord, verifyTxt);

router.get("/getapikey/:clientid", isAuthenticated, isAuthorized, getApiKey);

router.get("/generateapikey/:clientid", isAuthenticated, isAuthorized, generateApiKey);

router.delete("/deleteapikey/:clientid", isAuthenticated, isAuthorized, deleteApiKey);

module.exports = router;

// todo - add comments for register and login and verify controller.