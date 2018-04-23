var utility = require("./utility.js");
var db = require('../models');
var sgMail = require('@sendgrid/mail');

module.exports = { gateway, root, schedule, roster };

function gateway(req, res, next) {
    if (req.isAuthenticated()) {
        next();
        return;
    }
    res.redirect("/signin");
}

function root(req, res, next) {
    res.redirect("/dashboard/roster");
}


function schedule(req, res) {
    var data = {};
    db.findAllRows("gamemaps", function(error, result){
        if(error)
            {
                console.log(error);
                return; 
            }
        var maps = utility.mapOnId(result);
        db.findAllRows("teams", function(error, result){
            if(error)
                {
                    console.log(error);
                    return; 
                }
            var teams = utility.mapOnId(result);
            db.findAllRows("players", function(error, result){
                if(error)
                    {
                        console.log(error);
                        return; 
                    }
                var players = utility.mapOnId(result);
                db.findAllRows("heroes", function(error, result){
                    if(error)
                        {
                            console.log(error);
                            return; 
                        }
                    var heroes = utility.mapOnId(result);
                    db.findAllRows("playermatches", function(error, result){
                        if(error)
                            {
                                console.log(error);
                                return; 
                            }
                        var playerMatches = result;
                        var constraint = {
                            user_id: req.user.id
                        }
                        db.findAllWithConstraint("points", constraint, "", function (error, result) {
                            if(error)
                                {
                                    console.log(error);
                                    return; 
                                }
                            var points = result;
                            db.findAllRows("matches", function(error, result){
                                if(error)
                                    {
                                        console.log(error);
                                        return; 
                                    }
                                var matches = result;
                                //var matches = utility.mapOnId(result);
                                var matchesMap = new Map();
                                for (var m = 0; m < matches.length; m++) {
                                    var match = matches[m];
                                    console.log(match.match_datetime < now);

                                    var teamAwayId = match.team_away;
                                    var teamHomeId = match.team_home;
                                    var map1WinnerId = match.map1_winner;
                                    var map2WinnerId = match.map2_winner;
                                    var map3WinnerId = match.map3_winner;
                                    var map4WinnerId = match.map4_winner;
                                    var map5WinnerId = match.map5_winner;
                                    var map1Id = match.map1;
                                    var map2Id = match.map2;
                                    var map3Id = match.map3;
                                    var map4Id = match.map4;
                                    var map5Id = match.map5 ? match.map5 : 99;
                                    var awayTeamName = teams.get(teamAwayId) ? teams.get(teamAwayId).name : "None";
                                    var homeTeamName = teams.get(teamHomeId) ? teams.get(teamHomeId).name : "None";
                                    var map1WinnerName = teams.get(map1WinnerId) ? teams.get(map1WinnerId).name : "None";
                                    var map2WinnerName = teams.get(map2WinnerId) ? teams.get(map2WinnerId).name : "None";
                                    var map3WinnerName = teams.get(map3WinnerId) ? teams.get(map3WinnerId).name : "None";
                                    var map4WinnerName = teams.get(map4WinnerId) ? teams.get(map4WinnerId).name : "None";
                                    var map5WinnerName = teams.get(map5WinnerId) ? teams.get(map5WinnerId).name : "N/A";
                                    var map1Name = maps.get(map1Id) ? maps.get(map1Id).name : "None";
                                    var map2Name = maps.get(map2Id) ? maps.get(map2Id).name : "None";
                                    var map3Name = maps.get(map3Id) ? maps.get(map3Id).name : "None";
                                    var map4Name = maps.get(map4Id) ? maps.get(map4Id).name : "None";
                                    var map5Name = maps.get(map5Id) ? maps.get(map5Id).name : "N/A";
                                    var awayScore = 0;
                                    var homeScore = 0;
                                    var noData = match.map1_winner ? false : true; 
                                    map1WinnerId == teamAwayId ? awayScore++ : homeScore++;
                                    map2WinnerId == teamAwayId ? awayScore++ : homeScore++;
                                    map3WinnerId == teamAwayId ? awayScore++ : homeScore++;
                                    map4WinnerId == teamAwayId ? awayScore++ : homeScore++;
                                    map5WinnerId == teamAwayId ? awayScore++ : homeScore++;
                                    var winningTeamId = awayScore > homeScore ? teamAwayId : teamHomeId;
                                    teams.get(teamAwayId);
                                    var matchData = {
                                        id: match.id,
                                        stageId: match.stage_id,
                                        teamAwayName: awayTeamName,
                                        teamHomeName: homeTeamName,
                                        teamAwayId: teamAwayId,
                                        teamHomeId: teamHomeId,
                                        datetime: match.match_datetime,
                                        map1Id: map1Id,
                                        map2Id: map2Id,
                                        map3Id: map3Id,
                                        map4Id: map4Id,
                                        map5Id: map5Id,
                                        map1Name: map1Name,
                                        map2Name: map2Name,
                                        map3Name: map3Name,
                                        map4Name: map4Name,
                                        map5Name: map5Name,
                                        map1WinnerId: map1WinnerId,
                                        map2WinnerId: map2WinnerId,
                                        map3WinnerId: map3WinnerId,
                                        map4WinnerId: map4WinnerId,
                                        map5WinnerId: map5WinnerId,
                                        map1WinnerName: map1WinnerName,
                                        map2WinnerName: map2WinnerName,
                                        map3WinnerName: map3WinnerName,
                                        map4WinnerName: map4WinnerName,
                                        map5WinnerName: map5WinnerName,
                                        winningTeamId: winningTeamId,
                                        playerMatches: {
                                            homeTeam: {
                                                map1: [],
                                                map2: [],
                                                map3: [],
                                                map4: [],
                                                map5: []
                                            },
                                            awayTeam: {
                                                map1: [],
                                                map2: [],
                                                map3: [],
                                                map4: [],
                                                map5: []
                                            }
                                        },
                                        noData: noData
                                    }
                                    //matchesArr.push(matchData);
                                    matchesMap.set(match.id, matchData);
                                }
                                // Map for use by Points loop to get matchId from playerMatchId
                                // var playerMatchesMap = new Map();
                                var pointsSet = new Set();
                                for (var o = 0; o < points.length; o++) {
                                    pointsSet.add(points[o].player_match_id);
                                    // var playerMatchId = point.player_match_id;
                                    // var matchId = playerMatchesMap.get(playerMatchId).match_id;
                                    // var pointData = {

                                    // };
                                    // matchesArr[(matchId - 1)].points.push(pointData);
                                    // console.log(matchId);
                                }
                                for (var p = 0; p < playerMatches.length; p++) {
                                    var playerMatch = playerMatches[p];
                                    var connectedMatch = matchesMap.get(playerMatch.match_id);
                                    var playerId = playerMatch.player_id;
                                    var playerName = players.get(playerId) ? players.get(playerId).name : "None";
                                    var heroId = playerMatch.hero_id;
                                    var heroName = heroes.get(heroId) ? heroes.get(heroId).hero_name : "None";
                                    var teamId = playerMatch.team_id;
                                    var mapId = playerMatch.map_id;
                                    var role = players.get(playerId) ? players.get(playerId).role : "None";
                                    
                                    var playerMatchData = {
                                        playerId: playerId,
                                        playerName: playerName,
                                        heroId: heroId,
                                        heroName: heroName,
                                        kills: playerMatch.kills,
                                        deaths: playerMatch.deaths,
                                        points: playerMatch.points,
                                        userHas: pointsSet.has(playerMatch.id),
                                        role: role.toLowerCase()
                                    };
                                    //connectedMatch.playerMatches.push(playerMatchData);
                                    // playerMatchesMap.set(playerMatch.id, playerMatch);
                                    if (connectedMatch.teamHomeId === teamId) {
                                        // console.log(mapId);
                                        // console.log(connectedMatch.map1Id);
                                        // console.log(connectedMatch);
                                        switch (mapId) {
                                            case connectedMatch.map1Id:
                                                connectedMatch.playerMatches.homeTeam.map1.push(playerMatchData);
                                                break;
                                            case connectedMatch.map2Id:
                                                connectedMatch.playerMatches.homeTeam.map2.push(playerMatchData);
                                                break;
                                            case connectedMatch.map3Id:
                                                connectedMatch.playerMatches.homeTeam.map3.push(playerMatchData);
                                                break;
                                            case connectedMatch.map4Id:
                                                connectedMatch.playerMatches.homeTeam.map4.push(playerMatchData);
                                                break;
                                            case connectedMatch.map5Id:
                                                connectedMatch.playerMatches.homeTeam.map5.push(playerMatchData);
                                                break;
                                        }
                                    } else if (connectedMatch.teamAwayId === teamId) {
                                        switch (mapId) {
                                            case connectedMatch.map1Id:
                                                connectedMatch.playerMatches.awayTeam.map1.push(playerMatchData);
                                                break;
                                            case connectedMatch.map2Id:
                                                connectedMatch.playerMatches.awayTeam.map2.push(playerMatchData);
                                                break;
                                            case connectedMatch.map3Id:
                                                connectedMatch.playerMatches.awayTeam.map3.push(playerMatchData);
                                                break;
                                            case connectedMatch.map4Id:
                                                connectedMatch.playerMatches.awayTeam.map4.push(playerMatchData);
                                                break;
                                            case connectedMatch.map5Id:
                                                connectedMatch.playerMatches.awayTeam.map5.push(playerMatchData);
                                                break;
                                        }
                                    }

                                    connectedMatch.playerMatches.awayTeam.map1.sort(function (a, b) {
                                        return b.points - a.points;
                                    });
                                    connectedMatch.playerMatches.awayTeam.map2.sort(function (a, b) {
                                        return b.points - a.points;
                                    });
                                    connectedMatch.playerMatches.awayTeam.map3.sort(function (a, b) {
                                        return b.points - a.points;
                                    });
                                    connectedMatch.playerMatches.awayTeam.map4.sort(function (a, b) {
                                        return b.points - a.points;
                                    });
                                    connectedMatch.playerMatches.awayTeam.map5.sort(function (a, b) {
                                        return b.points - a.points;
                                    });
                                    connectedMatch.playerMatches.homeTeam.map1.sort(function (a, b) {
                                        return b.points - a.points;
                                    });
                                    connectedMatch.playerMatches.homeTeam.map2.sort(function (a, b) {
                                        return b.points - a.points;
                                    });
                                    connectedMatch.playerMatches.homeTeam.map3.sort(function (a, b) {
                                        return b.points - a.points;
                                    });
                                    connectedMatch.playerMatches.homeTeam.map4.sort(function (a, b) {
                                        return b.points - a.points;
                                    });
                                    connectedMatch.playerMatches.homeTeam.map5.sort(function (a, b) {
                                        return b.points - a.points;
                                    });

                                }



                                var now = new Date();
                                var upcomingMatches = [];
                                var previousMatches = [];
                                matchesMap.forEach(function (value, key) {
                                    if (value.datetime < now && value.playerMatches.homeTeam.map1.length > 0) {
                                        previousMatches.push(value);
                                    } else {
                                        upcomingMatches.push(value);
                                    }
                                });
                                // sort previousMatches by latest date first
                                previousMatches.sort(function (a, b) {
                                    return new Date(b.datetime) - new Date(a.datetime);
                                });
                                
                                // for testing

                                //previousMatches.length = 15;
                                // sort upcomingMatches by earliest date first
                                upcomingMatches.sort(function (a, b) {
                                    return new Date(b.datetime) + new Date(a.datetime);
                                });
                                data.previousMatches = previousMatches;
                                data.upcomingMatches = upcomingMatches;
                                res.render('schedule', data);
                            });
                        });
                    });
                });
            });
        });
    });
}


function roster(req, res) {
    var data = {};
    var userTotalPoints = 0;
    var error;

    db.findOneRowWithColumnValue("globals", "key", "rosterLock", function (error, result) {
        if(error)
        {
            console.log(error);
            return;
        }
        var rosterLock = result.value;
        data.rosterLock = rosterLock;
        var constraint = {
            user_id: req.user.id,
            leaderboard_name: "global"
        }
        db.findOneWithConstraint("leaderboards", constraint, "", function (error, result) {
            if(error)
            {
                console.log(error);
                return;
            }
            var rank = 0; 
            if (result) {
                rank = result.rank; 
            }
            db.findAllRows("teams", function (error, results) {
                if(error)
                {
                    console.log(error);
                    return;
                }
                var teams = results;
                if (teams.length === 0) {
                    error = "No teams data.";
                    data.error = error;
                    res.render('roster', data);
                    return;
                }

                db.findAllRowsOrderBy("players", "ORDER BY name ASC ", function (error, results) {
                    if(error)
                    {
                        console.log(error);
                        return;
                    }
                    var playersRes = results;
                    var players = [];
                    if (results.length === 0) {
                        error = "No player data.";
                        data.error = error;
                        res.render('roster', data);
                        return;
                    }
                    for (var p = 0; p < playersRes.length; p++) {
                        (function () {
                            var player = playersRes[p];
                            var name = player.name;
                            var id = player.id;
                            var teamId = player.team_id;
                            var role = player.role.toLowerCase();
                            var teamName = utility.getTeamNameFromTeamId(teams, player.team_id);
                            var constraint = {
                                player_id: player.id,
                                user_id: req.user.id
                            };
                            db.findAllWithConstraint("points", constraint, "", function (error, results) {
                                if(error)
                                {
                                    console.log(error);
                                    return;
                                }
                                var points = results;
                                var totalPoints = 0;
                                for (var m = 0; m < points.length; m++) {
                                    var point = points[m];
                                    totalPoints += point.points;
                                    userTotalPoints += point.points;
                                }
                                var playerData = {
                                    name: name,
                                    id: id,
                                    teamName: teamName,
                                    teamId: teamId,
                                    role: role,
                                    totalPoints: parseFloat(totalPoints.toFixed(2))
                                };
                                if (name === "Jeff Kaplan") {
                                    playerData.jeff = true;
                                }
                                players.push(playerData);
                                if (players.length === playersRes.length) {
                                    players.sort(function (obj1, obj2) {
                                        return obj2.totalPoints - obj1.totalPoints;
                                    });
                                    var constraint = {
                                        user_id: req.user.id
                                    }
                                    db.findAllWithConstraint("rosters", constraint, "ORDER BY position ASC", function (error, results) {
                                        if(error)
                                        {
                                            console.log(error);
                                            return;
                                        }
                                        var rosterRes = results;
                                        var roster = [];
                                        for (var x = 0; x < rosterRes.length; x++) {
                                            if (rosterRes[x].player_id) {
                                                var found = players.find(function (element) {
                                                    return element.id === rosterRes[x].player_id;
                                                });
                                                roster.push(found);
                                            } else {
                                                if (x < 4) {
                                                    roster.push({ role: "offense" });
                                                } else if (x < 8) {
                                                    roster.push({ role: "tank" });
                                                } else if (x < 12) {
                                                    roster.push({ role: "support" });
                                                }

                                            }
                                        }
                                        // fill empty roster
                                        while (roster.length < 12) {
                                            if (roster.length < 4) {
                                                roster.push({ role: "offense" });
                                            } else if (roster.length < 8) {
                                                roster.push({ role: "tank" });
                                            } else {
                                                roster.push({ role: "support" });
                                            }
                                        }
                                        data.rank = rank;
                                        data.userTotalPoints = parseFloat(userTotalPoints.toFixed(2));
                                        data.players = players;
                                        data.roster = roster;
                                        data.error = error;
                                        res.render("roster", data);
                                        return;
                                    });
                                }
                            });
                        })();
                    }
                });
            });

        })
    });
}