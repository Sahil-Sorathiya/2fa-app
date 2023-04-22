const express = require("express");
const router = express.Router();
const { register, verifyClient, login } = require("../controllers/auth");
const { validateRegister, validateLogin } = require("../middlewares/validate");

router.post("/register", validateRegister, register);

router.get("/verify/:token", verifyClient);

router.post("/login", validateLogin, login);

module.exports = router;