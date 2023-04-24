const express = require("express");
const router = express.Router();
const { sendOtp, verifyOtp } = require("../controllers/otp");
const { validateSendOtp, validateVerifyOtp } = require("../middlewares/validate");
const { verifyApiKey } = require("../middlewares/verifyApiKey");
const { verifyTxtRecord } = require("../middlewares/verifyTxtRecord");
const { verifyRedirectionUrl } = require("../middlewares/verifyRedirectionUrl");

router.post("/sendotp", validateSendOtp, verifyApiKey, verifyTxtRecord, verifyRedirectionUrl, sendOtp);

router.post("/verifyotp", validateVerifyOtp, verifyOtp);

module.exports = router;