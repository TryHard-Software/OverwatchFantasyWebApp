
var db = require('../models');
var utility = require("./utility.js");
var moment = require('moment');
var bCrypt = require('bcrypt-nodejs');


module.exports = { liveStatsPost, liveStatsGet, updateRoster, updateChatHistory, getChatHistory, getLiveFeedHistory };

var teamsConversion = {
    "dragons": 2,
    "dynasty": 3,
    "excelsior": 10,
    "fuel": 4,
    "mayhem": 9,
    "outlaws": 5,
    "shock": 12,
    "uprising": 1,
    "valiant": 7,
    "spitfire": 6,
    "gladiators": 8,
    "fusion": 11
};

var heroConversion = {
    "ana": "Ana",
    "bastion": "Bastion",
    "junkrat": "Junkrat",
    "lucio": "Lucio",
    "genji": "Genji",
    "dva": "D.Va",
    "doomfist": "Doomfist",
    "hanzo": "Hanzo",
    "mccree": "Mccree",
    "mei": "Mei",
    "mercy": "Mercy",
    "moira": "Moria",
    "orisa": "Orisa",
    "pharah": "Pharah",
    "reaper": "Reaper",
    "reinhardt": "Reinhardt",
    "roadhog": "Roadhog",
    "soldier": "Soldier: 76",
    "sombra": "Sombra",
    "symmetra": "Symmetra",
    "torbjorn": "Torbjörn",
    "tracer": "Tracer",
    "widowmaker": "Widowmaker",
    "winston": "Winston",
    "zarya": "Zarya",
    "zenyatta": "Zenyatta",
    "brigitte": "Brigitte"
};

var liveStats = [];

function liveStatsPost(req, res) {
    var data = req.body;
    var token = req.query.token;
    if (token !== "wefweio587329fj32947fhwe923ry54y") {
        res.send("Invalid token.");
        return;
    } else {
        db.findAllRows("heroes", function (error, results) {
            if (error) {
                console.log(error);
                return;
            }
            var heroes = results;
            db.findAllRows("players", function (error, results) {
                if (error) {
                    console.log(error);
                    return;
                }
                var players = results;
                db.findAllRows("gamemaps", function (error, results) {
                    if (error) {
                        console.log(error);
                        return;
                    }
                    var maps = results;
                    data.killer_team_id = teamsConversion[data.killer_team];
                    data.victim_team_id = teamsConversion[data.victim_team];
                    data.killer_hero_id = utility.getHeroIdFromName(heroes, heroConversion[data.killer_hero]);
                    data.victim_hero_id = utility.getHeroIdFromName(heroes, heroConversion[data.victim_hero]);
                    data.killer_player_id = utility.getPlayerIdFromName(players, data.killer_name);
                    data.victim_player_id = utility.getPlayerIdFromName(players, data.victim_name);
                    data.map_id = utility.getMapIdFromOwlName(maps, data.map_name);
                    liveStats.push(data);
                    var noEternalLoops = 0;
                    while (liveStats.length > 10) {
                        liveStats.shift();
                        noEternalLoops += 1;
                        if (noEternalLoops > 5) {
                            break
                        }
                    }
                    res.send("Success.");
                });
            });
        });
    }
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
    var user_id = null;
    if (req.user) {
        var user_id = req.user.id;
    }
    var constraint = {
        user_id: user_id
    };
    db.findAllWithConstraint("rosters", constraint, "", function (error, results) {
        if (error) {
            console.log(error);
            return;
        }
        var roster = results;
        db.findAllRows("players", function (error, results) {
            if (error) {
                console.log(error);
                return;
            }
            var players = results;
            db.findAllRows("heroes", function (error, results) {
                if (error) {
                    console.log(error);
                    return;
                }
                var heroes = results;
                db.findAllRows("gamemaps", function (error, results) {
                    if (error) {
                        console.log(error);
                        return;
                    }
                    var maps = results;
                    var count = 0;
                    var size = maps.length * heroes.length;
                    var weights = {};
                    for (var h = 0; h < heroes.length; h++) {
                        (function () {
                            var hero = heroes[h];
                            weights[hero.id] = {};
                            for (var m = 0; m < maps.length; m++) {
                                (function () {
                                    var map = maps[m];
                                    var constraint = {
                                        map_id: map.id,
                                        hero_id: hero.id
                                    };
                                    db.findOneWithConstraint("weights", constraint, "ORDER BY createdAt DESC ", function (error, foundItem) {
                                        if (error) {
                                            console.log(error);
                                            return;
                                        }
                                        var weight = foundItem;
                                        weights[hero.id][map.id] = weight.kill_weight;
                                        count += 1;
                                        // once all weights have been gathered:
                                        if (count >= size) {
                                            var query = `select * from ?? ORDER BY ?? DESC LIMIT 10 `;
                                            var values = ["livestats", "createdAt"];
                                            db.customizedQuery(query, values, function (error, results) {
                                                if (error) {
                                                    console.log(error);
                                                    return;
                                                }
                                                for (var i = 0; i < results.length; i++) {
                                                    var feed = results[i];
                                                    var killer_id = utility.getPlayerIdFromName(players, feed.killer_name);
                                                    results[i].killer_id = killer_id;
                                                    var killer_heroid = utility.getHeroIdFromName(heroes, heroConversion[feed.killer_hero]);
                                                    results[i].killer_heroid = killer_heroid;
                                                    var killer_team_id = teamsConversion[feed.killer_team];
                                                    results[i].killer_team_id = killer_team_id;
                                                    var victim_id = utility.getPlayerIdFromName(players, feed.victim_name);
                                                    results[i].victim_id = victim_id;
                                                    var victim_heroid = utility.getHeroIdFromName(heroes, heroConversion[feed.victim_hero]);
                                                    results[i].victim_heroid = victim_heroid;
                                                    var victim_team_id = teamsConversion[feed.victim_team];
                                                    results[i].victim_team_id = victim_team_id;
                                                    var map_id = utility.getMapIdFromOwlName(maps, feed.map_name);
                                                    results[i].map_id = map_id;
                                                }
                                                results.sort(function (a, b) {
                                                    return new Date(a.createdAt) - new Date(b.createdAt);
                                                });
                                                var data = {
                                                    feeds: results,
                                                    roster: roster,
                                                    weights: weights
                                                }
                                                res.json(data);
                                            });
                                        }
                                    });
                                })();
                            }
                        })();
                    }
                });
            });
        });
    });
}