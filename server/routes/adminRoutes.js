var express = require("express");

var adminController = require("../controllers/adminController.js");

var adminRouter = express.Router();

var router = function (app, passport) {

    adminRouter.route("*").get(adminController.gateway);
    adminRouter.route("/").get(adminController.root);
    adminRouter.route("/global/rosterLock/true").get(adminController.rosterLockTrue);
    adminRouter.route("/global/rosterLock/false").get(adminController.rosterLockFalse);
    // Populates ./public/images/player_headshots with png's of filename "playerId.png" (ex: 1.png)
    adminRouter.route('/fill/playerpics').get(adminController.playerPics);
    adminRouter.route("/fill/weights").get(adminController.seedWeights);
    adminRouter.route("/fill/leaderboard").get(adminController.seedLeaderboard);
    adminRouter.route("/fill/weekly_leaderboard").get(adminController.seedWeeklyLeaderboard);
    
    return adminRouter;
};

module.exports = router;
