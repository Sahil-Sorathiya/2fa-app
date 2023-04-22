const express = require("express");
const router = express.Router();

const { dashboard } = require("../controllers/client");
const { isAuthenticated } = require("../middlewares/isAuthenticated");
const { isAuthorized } = require("../middlewares/isAuthorized");


router.get("/dashboard/:clientid", isAuthenticated, isAuthorized, dashboard);

module.exports = router;

// todo - add comments for register and login and verify controller.