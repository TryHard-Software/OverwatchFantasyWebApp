
var db = require('../models');
var utility = require("./utility.js");
var moment = require('moment');
var bCrypt = require('bcrypt-nodejs');


module.exports = { liveStatsPost, liveStatsGet, updateRoster, updateChatHistory, getChatHistory, getLiveFeedHistory };

var liveStats = [];

function liveStatsPost(req, res) {
    var data = req.body;
    var token = req.query.token;
    if (token === "wefweio587329fj32947fhwe923ry54y") {
        liveStats.push(data);
        var noEternalLoops = 0;
        while (liveStats.length > 10) {
            liveStats.shift();
            noEternalLoops += 1;
            if (noEternalLoops > 5) {
                break
            }
        }
    } else {
        console.log("invalid token");
    }
    res.send("success");
}

function liveStatsGet(req, res) {
    res.json(liveStats);
}

function updateRoster(req, res) {
    if (req.user) {
        db.findOneRowWithColumnValue("globals", "key", "rosterLock", function (error, result) {
            if (error) {
                console.log(error);
                return;
            }
            var lock = result.value;
            if (lock === "true") {
                res.json({ toast: "Roster is currently locked." });
                return;
            }
            db.findAllRows("players", function (error, results) {
                if (error) {
                    console.log(error);
                    return;
                }
                var players = results;
                if (players.length === 0) {
                    res.json({ message: "no player table" });
                    return;
                }
                var roster = req.body.roster;
                if (roster.length > 12) {
                    res.json({ toast: "Invalid roster" });
                }
                // loop through new roster
                // make sure its not faulty
                var ids = [];
                var roles = {
                    offense: [],
                    tank: [],
                    support: []
                };
                for (var i = 0; i < roster.length; i++) {
                    var id = roster[i];
                    if (id) {
                        // dont allow "unknown player" id in roster
                        if (id == 999998) {
                            res.json({ toast: "Invalid roster" });
                            return;
                        }
                        // check for duplicate ids
                        if (ids.indexOf(id) !== -1) {
                            res.json({ toast: "Invalid roster" });
                            return;
                        } else {
                            ids.push(id);
                        }
                        // enforce the limit on 4 of each role
                        var role = utility.getRoleFromPlayerId(players, id).toLowerCase();
                        roles[role].push(id);
                        if (roles.offense.length > 4
                            || roles.tank.length > 4
                            || roles.support.length > 4) {
                            res.json({ toast: "Invalid roster" });
                            return;
                        }
                    }
                }
                for (var i = 0; i < roster.length; i++) {
                    (function () {
                        var r = i;
                        // find roster position for user
                        var constraint = {
                            user_id: req.user.id,
                            position: r
                        }
                        db.findOneWithConstraint("rosters", constraint, "", function (error, foundItem) {
                            if (error) {
                                console.log(error);
                                return;
                            }
                            // if no db entry yet, create one
                            if (!foundItem) {
                                // Item not found, create a new one
                                var insertObj = {
                                    user_id: req.user.id,
                                    player_id: roster[r],
                                    position: r
                                };
                                db.insert("rosters", insertObj, function (error, result) {
                                    if (error) {
                                        console.log(error);
                                        return;
                                    }
                                })
                            }
                            // else update the current entry
                            else {
                                var insertObj = {
                                    player_id: roster[r]
                                };
                                var constraintObj = {
                                    user_id: req.user.id,
                                    position: r
                                };
                                db.update("rosters", insertObj, constraintObj, function (error, result) {
                                    if (error) {
                                        console.log(error);
                                        return;
                                    }
                                });
                            }
                        });
                    })();
                }
                res.json({ message: "success" });
            });
        });
    } else {
        res.json({ redirect: "/" });
    }
};

function updateChatHistory(req, res) {
    if (req.user) {
        var chatJson = {
            user_id: req.user.id,
            message: req.body.message
        }
        db.insert("chats", chatJson, function (error, result) {
            if (error) {
                console.log(error);
                return;
            }
        });
    }
};

function getChatHistory(req, res) {
    var query = "CALL sp_chatHistory()";
    db.customizedQuery(query, [], (function (error, results) {
        if (error) {
            console.log(error);
            return;
        }
        res.json(results[0]);
    }))
}

function getLiveFeedHistory(req, res) {

    db.findAllRows("players", function (error, results) {
        if (error) {
            console.log(error);
            return;
        }
        var players = results;

        var query = `select * from ?? ORDER BY ?? DESC LIMIT 10 `;
        var values = ["livestats", "createdAt"];
        db.customizedQuery(query, values, (function (error, results) {
            if (error) {
                console.log(error);
                return;
            }
            console.log(results);
            for (var i = 0; i < results.length; i++) {
                var feed = results[i];
                var killer_id = utility.getPlayerIdFromName(players, feed.killer_name);
                results[i].killer_id = killer_id;
                //var killer_heroid = utility.getHeroIdFromName(feed.kiler_hero);
                //results[i].killer_heroid = killer_heroid;
                var victim_id = utility.getPlayerIdFromName(players, feed.victim_name);
                results[i].victim_id = victim_id;
                //var victim_heroid = utility.getHeroIdFromName(feed.victim_hero);
                //results[i].victim_heroid = victim_heroid;
                console.log(results[i].killer_id); 
            }
            res.json(results);
        }))

    })

}