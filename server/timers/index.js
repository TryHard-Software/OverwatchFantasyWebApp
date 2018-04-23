var request = require('request');
var adminController = require('../controllers/adminController.js')

module.exports = { startPingSelf, seedDbLeaderboard, seedDbWeeklyLeaderboard };

function startPingSelf(minutes) {

    setInterval(function(){
        request('https://overwatchfantasy.gg/ping', function (error, response, body) {
        });
    }, 1000 * 60 * minutes);
}

function seedDbLeaderboard(minutes) {
    setInterval(function () {
        adminController.seedLeaderboard();
    }, 1000 * 60 * minutes);
}

function seedDbWeeklyLeaderboard(minutes) {
    setInterval(function () {
        adminController.seedWeeklyLeaderboard();
    }, 1000 * 60 * minutes);
}

