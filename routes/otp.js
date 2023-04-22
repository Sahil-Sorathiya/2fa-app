const express = require("express");
const router = express.Router();
const { otpRequest } = require("../controllers/otp");
const { validateSendOtp } = require("../middlewares/validate");
const { verifyApiKey } = require("../middlewares/verifyApiKey");
const { verifyTxtRecord } = require("../middlewares/verifyTxtRecord");

router.post("/sendotp",validateSendOtp, verifyApiKey, verifyTxtRecord, otpRequest);

module.exports = router;