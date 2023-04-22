const express = require("express");
const router = express.Router();
const { getApiKey, generateApiKey, deleteApiKey } = require("../controllers/api")
const { isAuthenticated } = require("../middlewares/isAuthenticated");
const { isAuthorized } = require("../middlewares/isAuthorized");

router.get("/getapikey/:clientid", isAuthenticated, isAuthorized, getApiKey);

router.get("/generateapikey/:clientid", isAuthenticated, isAuthorized, generateApiKey);

router.delete("/deleteapikey/:clientid", isAuthenticated, isAuthorized, deleteApiKey);

module.exports = router;