
var db = require('../models');
var utility = require("./utility.js");
var moment = require('moment');
var bCrypt = require('bcrypt-nodejs');


module.exports = { updateRoster, updateChatHistory, getChatHistory };

function updateRoster(req, res) {
    if (req.user) {
        db.findOneRowWithColumnValue("globals", "key", "rosterLock", function (error, result) {
            if(error)
            {
                console.log(error); 
                return;
            }
            var lock = result.value;
            if (lock === "true") {
                res.json({ toast: "Roster is currently locked." });
                return;
            }
            db.findAllRows("players", function (error, results) {
                if(error)
                {
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
                                if(error)
                                {
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
                                    db.insert("rosters", insertObj, function(error, result) {
                                        if (error) {
                                            console.log(error);
                                            return;
                                        }
                                    })
                                }
                                // else update the current entry
                                else {
                                    insertObj = {
                                        player_id: roster[r]
                                    };
                                    constraintObj = {
                                        user_id: req.user.id,
                                        position: r
                                    };
                                    db.update("rosters", insertObj, constraintObj, function(error, result) {
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
        db.insert("chats", chatJson, function(error, result) {
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