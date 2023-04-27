const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middlewares/isAuthenticated")
const { isAuthorized } = require("../middlewares/isAuthorized")
const { register,verifyRegister,  login, forgotPassword, verifyForgotPassword, changePassword } = require("../controllers/auth");
const { validateRegister, validateLogin, validateForgotPassword, validateChangePassword } = require("../middlewares/validate");

router.post("/register", validateRegister, register);

router.get("/verify/register/:token", verifyRegister);

router.post("/login", validateLogin, login);

router.post("/forgotpassword", validateForgotPassword, forgotPassword);

router.get("/verify/forgotpassword/:token", verifyForgotPassword)

router.post("/changepassword/:clientid", isAuthenticated, isAuthorized, validateChangePassword, changePassword)

module.exports = router;