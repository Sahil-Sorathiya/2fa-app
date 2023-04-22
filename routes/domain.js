const express = require("express");
const router = express.Router();
const { saveDomainAndGenerateTxt, verifyTxt } = require("../controllers/domain");
const { validateDomain } = require("../middlewares/validate");
const { isAuthenticated } = require("../middlewares/isAuthenticated");
const { isAuthorized } = require("../middlewares/isAuthorized");
const { verifyTxtRecord } = require("../middlewares/verifyTxtRecord");

router.post("/savedomain/:clientid", isAuthenticated, isAuthorized, validateDomain, saveDomainAndGenerateTxt);

router.post("/verifytxt/:clientid",isAuthenticated, isAuthorized, validateDomain, verifyTxtRecord, verifyTxt);

module.exports = router;