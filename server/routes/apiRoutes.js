var express = require("express");

var apiController = require("../controllers/apiController.js");

var apiRouter = express.Router();

var router = function(app, passport) {

    apiRouter.route('/livestats').post(apiController.liveStatsPost);

    apiRouter.route('/livestats').get(apiController.liveStatsGet);

    apiRouter.route('/updateRoster').post(apiController.updateRoster);

    apiRouter.route('/updateChatHistory').post(apiController.updateChatHistory);

    apiRouter.route('/getChatHistory').get(apiController.getChatHistory);

    apiRouter.route('/getLiveFeedHistory').get(apiController.getLiveFeedHistory);

    return apiRouter;
};

module.exports = router;
