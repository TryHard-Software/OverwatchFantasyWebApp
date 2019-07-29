
var db = require('../models');
var utility = require("./utility.js");
var moment = require('moment');
var bCrypt = require('bcrypt-nodejs');
var uuid = require('uuid/v4');


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
    "fusion": 11,
    "reign": 1000,
    "hunters": 1001,
    "charge": 1002,
    "spark": 1003,
    "eternal": 1004,
    "defiant": 1005,
    "titans": 1006,
    "justice": 1007
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
    "moira": "Moira",
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
    "brigitte": "Brigitte",
    "hammond": "Hammond",
    "ashe": "Ashe",
    "baptiste": "Baptiste"
};

var liveStats = [];

function liveStatsPost(req, res) {
    var data = req.body;
    var token = req.query.token;
    if (token !== process.env.LIVE_STATS_WEBHOOK_TOKEN) {
        res.send("Invalid token.");
        return;
    } else {
        res.send("Success.");
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
                db.findAllRows("matches", function (error, results) {
                    if (error) {
                        console.log(error);
                        return;
                    }
                    var matches = results;
                    db.findAllRows("gamemaps", function (error, results) {
                        if (error) {
                            console.log(error);
                            return;
                        }
                        var maps = results;
                        db.findAllRows("rosters", function (error, results) {
                            if (error) {
                                console.log(error);
                                return;
                            }
                            var rosters = results;
                            var getRecentWeightsSql = `
                                SELECT t1.*
                                FROM owf.weights AS t1
                                LEFT JOIN owf.weights AS t2
                                ON t1.hero_id = t2.hero_id
                                AND t1.createdAt < t2.createdAt
                                WHERE t2.id IS NULL AND t1.map_id = 1;
                            `;
                            db.customizedQuery(getRecentWeightsSql, function (error, results) {
                                if (error) return console.log(error);
                                var weights = results;
                                data.uuid = uuid();
                                data.killer_team_id = teamsConversion[data.killer_team];
                                data.victim_team_id = teamsConversion[data.victim_team];
                                data.killer_hero_id = utility.getHeroIdFromName(heroes, heroConversion[data.killer_hero]);
                                data.victim_hero_id = utility.getHeroIdFromName(heroes, heroConversion[data.victim_hero]);
                                data.killer_player_id = utility.getPlayerIdFromName(players, data.killer_name);
                                data.victim_player_id = utility.getPlayerIdFromName(players, data.victim_name);
                                data.match_id = utility.getMatchIdFromOwlMatchId(matches, data.owl_match_id);
                                data.map_id = utility.getMapIdFromOwlMapGuid(maps, data.map_guid);
                                data.points = utility.getWeightFromHeroId(weights, data.killer_hero_id);
                                if (data.points) data.points = parseFloat(data.points.toFixed(2));
                                data.action = "killed";
                                liveStats.push(data);
                                var noEternalLoops = 0;
                                while (liveStats.length > 10) {
                                    liveStats.shift();
                                    noEternalLoops += 1;
                                    if (noEternalLoops > 5) {
                                        break
                                    }
                                }
                                var query = `INSERT INTO livestats (uuid, killer_team,
                                    killer_name, killer_hero, victim_team, victim_name, victim_hero, action, map_name, killer_position, victim_position, match_id, map_index, map_id, createdAt, updatedAt)
                                VALUES
                                    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, current_timestamp, current_timestamp)`;
                                db.customizedQuery(query, [data.uuid, data.killer_team, data.killer_name, data.killer_hero,
                                data.victim_team, data.victim_name, data.victim_hero, 'killed', '', 0, 0, data.match_id, data.map_index, data.map_id], function (error, results) {
                                    if (error) return console.log(error);
                                });
                                var query2 = `INSERT INTO playermatches (match_id, player_id, hero_id, map_id, team_id, points, kills, deaths, ults_gained, map_win, match_datetime, time_played, createdAt, updatedAt)
                                VALUES
                                    (?, ?, ?, ?, ?, ?, 1, 0, 0, 0, current_timestamp, '00:00:00', current_timestamp, current_timestamp);`
                                db.customizedQuery(query2, [data.match_id, data.killer_player_id, data.killer_hero_id, data.map_id, data.killer_team_id, data.points], function (error, result) {
                                    if (error) return console.log(error);
                                    const playerMatchId = result.insertId;
                                    for (const roster of rosters) {
                                        if (roster.player_id === data.killer_player_id) {
                                            const query3 = `INSERT INTO points (user_id, player_id, player_match_id, points, createdAt, updatedAt)
                                            VALUES
                                                (?, ?, ?, ?, current_timestamp, current_timestamp);`
                                            const userId = roster.user_id;
                                            const killerPlayerId = data.killer_player_id;
                                            const points = data.points;
                                            setTimeout(()=> {
                                                db.customizedQuery(query3, [userId, killerPlayerId, playerMatchId, points], function (error, results) {
                                                    if (error) return console.log(error);
                                                    console.log("point inserted");
                                                });
                                            }, Math.floor(Math.random() * 100));
                                        }
                                    }
                                });    
                            });
                        });
                    });
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
                                                    var killer_hero_id = utility.getHeroIdFromName(heroes, heroConversion[feed.killer_hero]);
                                                    results[i].killer_hero_id = killer_hero_id;
                                                    var killer_team_id = teamsConversion[feed.killer_team];
                                                    results[i].killer_team_id = killer_team_id;
                                                    var victim_id = utility.getPlayerIdFromName(players, feed.victim_name);
                                                    results[i].victim_id = victim_id;
                                                    var victim_hero_id = utility.getHeroIdFromName(heroes, heroConversion[feed.victim_hero]);
                                                    results[i].victim_hero_id = victim_hero_id;
                                                    var victim_team_id = teamsConversion[feed.victim_team];
                                                    results[i].victim_team_id = victim_team_id;
                                                    // var map_id = utility.getMapIdFromOwlName(maps, feed.map_name);
                                                    // results[i].map_id = map_id;
                                                }
                                                results.sort(function (a, b) {
                                                    return new Date(a.createdAt) - new Date(b.createdAt);
                                                });
                                                var data = {
                                                    feeds: results,
                                                    roster: roster,
                                                    weights: weights
                                                };
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