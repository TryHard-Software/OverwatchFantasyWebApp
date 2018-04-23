var db = require('../models');
var utility = require("./utility.js");
var sgMail = require('@sendgrid/mail');

var exports = module.exports = {}

exports.news = function (req, res) {
    res.render('news');
};

exports.information = function (req, res) {
    res.render('information');
};

exports.live = function (req, res) {
    res.render('live');
};

exports.leaderboard = function (req, res) {
    var constraint = {
        leaderboard_name: "global"
    }
    db.findAllWithConstraint("leaderboards", constraint, "", function(error, results) {
        if(error)
        {
            console.log(error);
            return;
        }
        var usersRes = results;
        var limit = 100;
        if (usersRes.length > limit) {
            usersRes.length = limit;
        }
        var users = [];
        for (var u = 0; u < usersRes.length; u++) {
            var userRes = usersRes[u];
            var user = {
                username: userRes.username,
                totalPoints: userRes.points,
                roster: JSON.parse(userRes.roster)
            }
            users.push(user);
        }
        var data = {
            users: users
        }
        res.render("leaderboard", data);
    });
    return;
};

exports.weeklyLeaderboard = function (req, res) {
    var constraint = {
        leaderboard_name: "global_weekly"
    }
    db.findAllWithConstraint("leaderboards", constraint, "", function(error, results) {
        if(error)
        {
            console.log(error);
            return;
        }
        var usersRes = results;
        var limit = 100;
        if (usersRes.length > limit) {
            usersRes.length = limit;
        }
        var users = [];
        for (var u = 0; u < usersRes.length; u++) {
            var userRes = usersRes[u];
            var user = {
                username: userRes.username,
                totalPoints: userRes.points,
                roster: JSON.parse(userRes.roster)
            }
            users.push(user);
        }
        var data = {
            users: users
        }
        res.render("weeklyLeaderboard", data);
    });
    return;
};

exports.sendreport = function (req, res) {
    db.findOneRowWithId("users", req.user.id, function (err, found) {
        if(error)
        {
            console.log(error);
            return;
        }
        var email = found.email; 
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        const msg = {
            to: "OverwatchFantasy@tutanota.com",
            from: email,
            subject: req.body.title,
            text: req.body.message
        };

        sgMail.send(msg).then(function (err, results) {
            if (err)
            {
                console.log(err);    
                return; 
            }
            console.log("email successfully sent");
        });
    })
}

exports.about = function (req, res) {
    res.render('about');
};

exports.home = function (req, res) {
    res.render('home');
};

exports.tutorial = function (req, res) {
    res.render('tutorial');
};