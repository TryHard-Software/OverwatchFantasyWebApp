
var express = require("express");
var newAuthController = require('../controllers/newAuthController.js');
var newAuthRouter = express.Router();

var router = function (app) {

    newAuthRouter.route('/login').post(newAuthController.login);

    return newAuthRouter;
};

module.exports = router;
