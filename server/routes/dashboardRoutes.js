var express = require("express");

var dashboardController = require("../controllers/dashboardController.js");

var dashboardRouter = express.Router();

var router = function (app, passport) {

    dashboardRouter.route('*').get(dashboardController.gateway);

    dashboardRouter.route('/').get(dashboardController.root);

    dashboardRouter.route('/roster').get(dashboardController.roster);

    dashboardRouter.route('/schedule').get(dashboardController.schedule);

    return dashboardRouter;
};

module.exports = router;
