var request = require("request");
var child_process = require("child_process");
var fs = require('fs');
const path = require('path');

const MIN_WAIT_MS = 30000;
const FRAMES_FOLDER_NAME = __dirname + '/frames';

let playerHeroes = ["", "", "", "", "", "", "", "", "", "", "", ""];
let playerHeroGuesses = [[], [], [], [], [], [], [], [], [], [], [], []];
let killIdTicker = 0;
let kills = {};

if (!fs.existsSync(FRAMES_FOLDER_NAME)) {
    fs.mkdirSync(FRAMES_FOLDER_NAME);
}

(async () => {
    try {
        let epochStart;
        for (let b = 0; b < 10000000; b++) {
            console.log("=========== Restart ===========");
            epochStart = Date.now();
            try {
                await scrapeStream();
            } catch (error) {
                console.error(error);
                const transpiredMs = Date.now() - epochStart;
                if (transpiredMs < MIN_WAIT_MS) {
                    await timeout(MIN_WAIT_MS - transpiredMs);
                }
            }
        }
    } catch (error) {
        console.error(error);
    }
})();

async function scrapeStream() {
    try {
        fs.readdir(FRAMES_FOLDER_NAME, (err, files) => {
            if (err) throw err;

            for (const file of files) {
                fs.unlink(path.join(FRAMES_FOLDER_NAME, file), err => {
                    if (err) throw err;
                });
            }
        });
        const matchStatus = await getLiveMatch();
        // console.log(matchStatus);
        if (matchStatus.status !== "IN_PROGRESS") {
            playerHeroes = ["", "", "", "", "", "", "", "", "", "", "", ""];
            playerHeroGuesses = [[], [], [], [], [], [], [], [], [], [], [], []];
            killIdTicker = 0;
            kills = {};
            throw "match not in progress";
        }
        // const { body: mapReqBody } = await requestP({
        //     method: "GET",
        //     url: "https://api.overwatchleague.com/stats/matches/21349/maps/3",
        //     json: true
        // });
        // console.log(mapReqBody);
        // var teamsConversion = {
        //     "dragons": 2,
        //     "dynasty": 3,
        //     "excelsior": 10,
        //     "fuel": 4,
        //     "mayhem": 9,
        //     "outlaws": 5,
        //     "shock": 12,
        //     "uprising": 1,
        //     "valiant": 7,
        //     "spitfire": 6,
        //     "gladiators": 8,
        //     "fusion": 11,
        //     "reign": 1000,
        //     "hunters": 1001,
        //     "charge": 1002,
        //     "spark": 1003,
        //     "eternal": 1004,
        //     "defiant": 1005,
        //     "titans": 1006,
        //     "justice": 1007
        // };
        let teamNameMap = {
            "Shanghai Dragons": "dragons",
            "Seoul Dynasty": "dynasty",
            "New York Excelsior": "excelsior",
            "Dallas Fuel": "fuel",
            "Florida Mayhem": "mayhem",
            "Houston Outlaws": "outlaws",
            "San Francisco Shock": "shock",
            "Boston Uprising": "uprising",
            "LA Valiant": "valiant",
            "London Spitfire": "spitfire",
            "LA Gladiators": "gladiators",
            "Philadelphia Fusion": "fusion",
            "Atlanta Reign": "reign",
            "Chengdu Hunters": "hunters",
            "Guangzhou Charge": "charge",
            "Hangzhou Spark": "spark",
            "Paris Eternal": "eternal",
            "Toronto Defiant": "defiant",
            "Vancouver Titans": "titans",
            "Washington DC Justice": "justice"
        };
        // let teamNameMapReverse = {};
        // Object.keys(teamNameMap).forEach(key => {
        //     teamNameMapReverse[teamNameMap[key]] = key;
        // });
        let swapTeams = false;
        let teamsTracked = false;
        let { playerMap: playerMapInit, statsStreamUri, mapStreamUri, leftTeam, rightTeam } = await getPlayerMap();
        let teamsRef = {
            left: teamNameMap[leftTeam],
            right: teamNameMap[rightTeam]
        };
        let alreadyAnalyzedFrames = [];
        const ffmpeg = child_process.spawn("ffmpeg", [
            '-y',
            '-i', mapStreamUri,
            '-vf', 'fps=1', // PCM 16bits, little-endian
            FRAMES_FOLDER_NAME + '/frame%03d.png' // Output on stdout
        ]);
        // ffmpeg.stderr.on('data', (data) => {
        //     console.error(`stderr: ${data}`);
        // });
        let epochStart = Date.now();
        let msMax = 100000000;
        let msInterval = 100;
        let getOut = false;
        for (let x = 0; x < 100000; x++) {
            // runs 10 times a second
            await timeout(msInterval);
            if (getOut) {
                ffmpeg.kill('SIGINT');
                return;
            }
            if (Date.now() > epochStart + msMax) {
                console.log("done");
                ffmpeg.kill('SIGINT');
                return;
            }
            const files = await filewalkP(FRAMES_FOLDER_NAME);
            files.sort();
            files.reverse();
            let file = files[0];
            if (!file) continue;
            if (file > "frame070.png") getOut = true;
            if (alreadyAnalyzedFrames.indexOf(file) !== -1) continue;
            console.log(file.substr(5, 3));
            alreadyAnalyzedFrames.push(file);
            // runs every frame (every second)
            // loop through kills and increase ticker every second
            Object.keys(kills).forEach(key => {
                const kill = kills[key];
                kill.ticker += 1;
                if (kill.ticker > 10) {
                    delete kills[kill.id];
                }
            });
            let pGuesses = await childProcessSpawnP("python", [
                __dirname + '/get_team_heroes.py',
                FRAMES_FOLDER_NAME + '/' + file
            ]);
            if (pGuesses == "timeout") {
                console.error("timeout");
                continue;
            }

            if (pGuesses == "[['', '', '', '', '', ''], ['', '', '', '', '', '']]") {
                console.log("empty heroes");
                continue;
            }
            if (pGuesses == "blocked") {
                console.log("blocked");
                continue;
            }
            const getArrayFromPythonResponse = function (pythonResponse) {
                pythonResponse = pythonResponse.replace(/]/g, "");
                pythonResponse = pythonResponse.replace(/\[/g, "");
                pythonResponse = pythonResponse.replace(/'/g, "");
                pythonResponse = pythonResponse.replace(/ /g, "");
                pythonResponse = pythonResponse.split(",");
                return pythonResponse;
            }
            if (!teamsTracked) {
                let teamGuesses = await childProcessSpawnP("python", [
                    __dirname + '/get_teams.py',
                    FRAMES_FOLDER_NAME + '/' + file
                ]);
                if (teamGuesses == "timeout") {
                    console.error("timeout");
                    continue;
                }
                teamGuesses = getArrayFromPythonResponse(teamGuesses);
                if (teamGuesses[0] && teamGuesses[1]) {
                    if ((teamGuesses[0] == teamNameMap[matchStatus.firstTeamName]
                        && teamGuesses[1] == teamNameMap[matchStatus.secondTeamName])
                        || (teamGuesses[1] == teamNameMap[matchStatus.firstTeamName]
                            && teamGuesses[0] == teamNameMap[matchStatus.secondTeamName])) {
                        if (teamsRef.left == teamGuesses[1]
                            && teamsRef.right == teamGuesses[0]) {
                            teamsTracked = true;
                            swapTeams = true;
                            teamsRef.left = teamGuesses[0];
                            teamsRef.right = teamGuesses[1];
                        } else if (teamsRef.left == teamGuesses[0]
                            && teamsRef.right == teamGuesses[1]) {
                            teamsTracked = true;
                        }
                    } else {
                        console.error("python teams don't match matchStatus");
                        continue;
                    }
                }
            }
            pGuesses = getArrayFromPythonResponse(pGuesses);
            let playerMap;
            //if (swapTeams) pGuesses = flipTeamArray(pGuesses);
            // swapTeams = true;
            if (swapTeams) {
                playerMap = flipPlayerMap(playerMapInit);
            } else {
                playerMap = playerMapInit;
            }
            let badGuessesCount = 0;
            for (let i = 0; i < pGuesses.length; i++) {
                if (pGuesses[i] == " " || pGuesses[i] == "") {
                    badGuessesCount += 1;
                }
            }
            if (badGuessesCount > 5) {
                console.log("not enough hero guesses");
                continue;
            }
            for (let i = 0; i < pGuesses.length; i++) {
                if (pGuesses[i] != " " && pGuesses[i] != "") {
                    playerHeroGuesses[i].push(pGuesses[i]);
                    if (playerHeroGuesses[i].length > 10) {
                        playerHeroGuesses[i].shift();
                        playerHeroes[i] = mode(playerHeroGuesses[i]);
                    }
                }
            }
            let guesses = await childProcessSpawnP("python", [
                __dirname + '/get_killfeed.py',
                FRAMES_FOLDER_NAME + '/' + file
            ]);
            if (guesses == "timeout") {
                console.error("timeout");
                continue;
            }
            // try {
            //     fs.unlinkSync('./frames/' + file);
            // } catch (error) {
            //     console.error(error);
            // }
            const killfeedReports = [[], [], [], [], [], [], [], [], [], [], [], []];
            for (let v = 0; v < 11; v++) {
                let guess = guesses.substr(guesses.indexOf(`${v}:`) + 4 + v.toString().length - 1, guesses.indexOf(`${v + 1}:`) - guesses.indexOf(`${v}:`) - 7 - v.toString().length + 1);
                guess = guess.replace(/'/g, "");
                guess = guess.replace(/ /g, "");
                guess = guess.split(",");
                if (guess[0] != '0') {
                    killfeedReports[v][0] = guess[0];
                    killfeedReports[v][1] = guess[6];
                }
            }
            var guess11 = guesses.substr(guesses.indexOf(`11:`) + 5, guesses.indexOf('}') - guesses.indexOf(`11:`) - 6);
            guess11 = guess11.replace(/'/g, "");
            guess11 = guess11.replace(/ /g, "");
            guess11 = guess11.split(",");
            if (guess11[0] != '0') {
                killfeedReports[11][0] = guess11[0];
                killfeedReports[11][1] = guess11[6];
            }
            for (let h = 0; h < 6; h++) {
                if (killfeedReports[h][1] && killfeedReports[h + 6][1]
                    && killfeedReports[h][1] != 'none' && killfeedReports[h + 6][1] != 'none'
                    && killfeedReports[h][1] != killfeedReports[h + 6][1]) {
                    let killer = "";
                    let victim = "";
                    if (killfeedReports[h][1] == "left") {
                        for (let n = 0; n < 6; n++) {
                            if (playerHeroes[n] == killfeedReports[h][0]) {
                                killer = playerMap[n];
                            }
                        }
                    } else {
                        for (let n = 0; n < 6; n++) {
                            if (playerHeroes[n + 6] == killfeedReports[h][0]) {
                                killer = playerMap[n + 6];
                            }
                        }
                    }
                    if (killfeedReports[h + 6][1] == "left") {
                        for (let n = 0; n < 6; n++) {
                            if (playerHeroes[n] == killfeedReports[h + 6][0]) {
                                victim = playerMap[n];
                            }
                        }
                    } else {
                        for (let n = 0; n < 6; n++) {
                            if (playerHeroes[n + 6] == killfeedReports[h + 6][0]) {
                                victim = playerMap[n + 6];
                            }
                        }
                    }
                    killIdTicker += 1;
                    const killObj = {
                        id: killIdTicker,
                        killerUsername: killer,
                        killerHero: killfeedReports[h][0],
                        killerTeam: killfeedReports[h][1],
                        victimUsername: victim,
                        victimHero: killfeedReports[h + 6][0],
                        victimTeam: killfeedReports[h + 6][1],
                        ticker: 0,
                        tracked: 0
                    };
                    if (killObj.killerUsername && killObj.victimUsername) {
                        let trackIt = true;
                        let added = false;
                        Object.keys(kills).forEach(key => {
                            const kill = kills[key];
                            if (kill.killerHero == killObj.killerHero
                                && kill.killerTeam == killObj.killerTeam
                                && kill.victimHero == killObj.victimHero
                                && kill.victimTeam == killObj.victimTeam
                            ) {
                                // console.log(kill.tracked);
                                added = true;
                                kill.tracked += 1;
                                // if (kill.tracked == 1) trackIt = true;
                                trackIt = false;
                            }
                        });
                        if (!added) {
                            kills[killObj.id] = killObj;
                        }
                        if (trackIt) {
                            killObj.id = killObj.killerUsername + "_" + killObj.victimUsername + "_" + Date.now();
                            console.log(`${killObj.killerHero} [${killObj.killerUsername}] (${killObj.killerTeam}) killed ${killObj.victimHero} [${killObj.victimUsername}] (${killObj.victimTeam})`);
                            let livestatsUrlHostname = 'http://localhost:3000';
                            if (process.env.NODE_ENV == 'production') {
                                livestatsUrlHostname = 'https://overwatchfantasy.gg';
                            }
                            request({
                                url: `${livestatsUrlHostname}/api/livestats?token=wefweio587329fj32947fhwe923ry54y`,
                                method: "POST",
                                body: {
                                    // 'uuid': uuid(),
                                    // 'map_name': 'volskaya',
                                    'killer_team': teamsRef[killObj.killerTeam],
                                    'killer_name': killObj.killerUsername,
                                    'killer_hero': killObj.killerHero,
                                    'victim_team': teamsRef[killObj.victimTeam],
                                    'victim_name': killObj.victimUsername,
                                    'victim_hero': killObj.victimHero,
                                    // 'action': 'killed'
                                },
                                json: true
                            }, (err, response, body) => {
                                if (err) {
                                    console.error(err);
                                }
                            });
                        }
                    }
                }
            }
        }
        return true;
    } catch (error) {
        throw error;
    }
}

function requestP(options) {
    return new Promise((resolve, reject) => {
        request(options, function (error, response, body) {
            if (error) return reject(error);
            resolve({ response, body });
        });
    });
}

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function childProcessSpawnP(cmd, args) {
    return new Promise((resolve, reject) => {
        let timeoutMs = 2000;
        let epochStart = Date.now();
        const task = child_process.spawn(cmd, args);
        setTimeout(() => {
            task.kill('SIGINT');
            return resolve("timeout");
        }, timeoutMs);
        task.stdout.on('data', (data) => {
            data = (new Buffer.from(data, 'binary')).toString('utf8');
            let epochEnd = Date.now();
            // console.log(args[0] + ": " + (epochEnd - epochStart));
            return resolve(data);
        });
        task.on('error', (error) => {
            return reject(error);
        });
        task.on('uncaughtException', (error) => {
            return reject(error);
        });
        task.on('end', (data) => {
            return reject(data);
        });
        task.stderr.on('data', (data) => {
            data = (new Buffer.from(data, 'binary')).toString('utf8')
            return reject(data);
        });
        task.on('close', (code, signal) => {
            return reject(code);
        });
        task.on('exit', (code) => {
            return reject(code);
        });
    });
}

const filewalkP = folderName => {
    return new Promise((resolve, reject) => {
        fs.readdir(folderName, (err, files) => {
            if (err) return reject(err);
            return resolve(files);
        });
    });
}

async function getPlayerMap() {
    try {
        let leftTeam;
        let rightTeam;
        const { body: commandCenterBody } = await requestP({
            method: "POST",
            url: "https://gql.twitch.tv/gql",
            headers: {
                "Client-Id": "kimne78kx3ncx6brgo4mv6wki5h1ko"
            },
            body: [
                {
                    "operationName": "MultiviewGetChanletDetails",
                    "variables": {
                        "channelLogin": "overwatchleague"
                    },
                    "extensions": {
                        "persistedQuery": {
                            "version": 1,
                            "sha256Hash": "297936e8ed4a37af0d315240ff7acd5af9eb12e18b4ff8dd4ae23c2aed185c75"
                        }
                    }
                }
            ],
            json: true
        });
        const searchStrings = [
            "Team A - Player 1 - POV",
            "Team A - Player 2 - POV",
            "Team A - Player 3 - POV",
            "Team A - Player 4 - POV",
            "Team A - Player 5 - POV",
            "Team A - Player 6 - POV",
            "Team B - Player 1 - POV",
            "Team B - Player 2 - POV",
            "Team B - Player 3 - POV",
            "Team B - Player 4 - POV",
            "Team B - Player 5 - POV",
            "Team B - Player 6 - POV"
        ];
        const playerMap = {};
        let streamLogin;
        let streamLoginMap;
        const chanlets = commandCenterBody[0].data.user.channel.chanlets;
        for (let c = 0; c < chanlets.length; c++) {
            const chanlet = chanlets[c];
            const contentAttributes = chanlet.contentAttributes;
            for (const contentAttribute of contentAttributes) {
                for (let s = 0; s < searchStrings.length; s++) {
                    const searchString = searchStrings[s];
                    if (contentAttribute.value == searchString) {
                        for (const contentAttribute2 of contentAttributes) {
                            if (contentAttribute2.key == "player") {
                                playerMap[s] = contentAttribute2.value;
                            }
                        }
                    }
                }
                if (contentAttribute.value == "Team A - Player 1 - Comp") {
                    streamLogin = chanlet.owner.login;
                    for (const contentAttribute2 of contentAttributes) {
                        if (contentAttribute2.key == "team") {
                            leftTeam = contentAttribute2.value;
                        }
                    }
                }
                if (contentAttribute.value == "Team B - Player 1 - Comp") {
                    for (const contentAttribute2 of contentAttributes) {
                        if (contentAttribute2.key == "team") {
                            rightTeam = contentAttribute2.value;
                        }
                    }
                }
                if (contentAttribute.value == "Map") {
                    streamLoginMap = chanlet.owner.login;
                }
            }
        }
        if (!streamLogin) {
            throw "no streamLogin";
        }
        if (!streamLoginMap) {
            throw "no streamLoginMap";
        }
        streamLogin = 'overwatchleague';
        // if (Object.keys(playerMap).length < 1) {
        //     throw "playerMap empty";
        // }
        const statsStreamUri = await get720StreamUriFromTwitchUsername(streamLogin);
        const mapStreamUri = await get720StreamUriFromTwitchUsername(streamLoginMap);
        return { playerMap, statsStreamUri, mapStreamUri, leftTeam, rightTeam };
    } catch (error) {
        throw error;
    }
}

async function get720StreamUriFromTwitchUsername(streamLogin) {
    try {
        streamLogin = 'overwatchleague';
        let oauthToken = '';
        let playerType = 'site';
        //playerType = 'multiview-primary';
        const { body: authTokenBody } = await requestP({
            method: "GET",
            url: `https://api.twitch.tv/api/channels/${streamLogin}/access_token?need_https=true&oauth_token${oauthToken}&platform=web&player_backend=mediaplayer&player_type=${playerType}`,
            headers: {
                'Client-Id': 'kimne78kx3ncx6brgo4mv6wki5h1ko'
            },
            json: true
        });
        const playlistSig = authTokenBody.sig;
        const playlistToken = encodeURIComponent(authTokenBody.token);
        if (!playlistSig || !playlistToken) {
            throw "no playlistSig or playlistToken";
        }
        const streamPlaylistUrl = `https://usher.ttvnw.net/api/channel/hls/${streamLogin}.m3u8?allow_source=true&baking_bread=true&baking_brownies=true&baking_brownies_timeout=1050&fast_bread=true&p=312379&player_backend=mediaplayer&playlist_include_framerate=true&reassignments_supported=true&sig=${playlistSig}&token=${playlistToken}&preferred_codecs=avc1&cdm=wv`;
        const { body: playlistBody } = await requestP({
            method: "GET",
            url: streamPlaylistUrl
        });
        const firstM3u8 = playlistBody.indexOf(".m3u8");
        const newStr = playlistBody.substr(firstM3u8 + 5);
        const firstIndex = newStr.indexOf("https://");
        const secondIndex = newStr.indexOf(".m3u8");
        if (firstIndex == -1 || secondIndex == -1) {
            throw "firstIndex or secondIndex == -1";
        }
        const urlLength = secondIndex - firstIndex + 5;
        const streamUri = newStr.substr(firstIndex, urlLength);
        return streamUri;
    } catch (error) {
        throw error;
    }
}

function mode(array) {
    if (array.length == 0)
        return null;
    var modeMap = {};
    var maxEl = array[0], maxCount = 1;
    for (var i = 0; i < array.length; i++) {
        var el = array[i];
        if (modeMap[el] == null)
            modeMap[el] = 1;
        else
            modeMap[el]++;
        if (modeMap[el] > maxCount) {
            maxEl = el;
            maxCount = modeMap[el];
        }
    }
    return maxEl;
}

function flipPlayerMap(playerMap) {
    let tempObj = Object.assign({}, playerMap);
    playerMap[0] = tempObj[6];
    playerMap[1] = tempObj[7];
    playerMap[2] = tempObj[8];
    playerMap[3] = tempObj[9];
    playerMap[4] = tempObj[10];
    playerMap[5] = tempObj[11];
    playerMap[6] = tempObj[0];
    playerMap[7] = tempObj[1];
    playerMap[8] = tempObj[2];
    playerMap[9] = tempObj[3];
    playerMap[10] = tempObj[4];
    playerMap[11] = tempObj[5];
    return playerMap;
}

// function flipTeamArray(teamArray) {
//     let tempArray = Array.from(teamArray);
//     teamArray[0] = tempArray[6];
//     teamArray[1] = tempArray[7];
//     teamArray[2] = tempArray[8];
//     teamArray[3] = tempArray[9];
//     teamArray[4] = tempArray[10];
//     teamArray[5] = tempArray[11];
//     teamArray[6] = tempArray[0];
//     teamArray[7] = tempArray[1];
//     teamArray[8] = tempArray[2];
//     teamArray[9] = tempArray[3];
//     teamArray[10] = tempArray[4];
//     teamArray[11] = tempArray[5];
//     return teamArray;
// }

async function getLiveMatch() {
    const { body: liveMatchBody } = await requestP({
        method: "GET",
        url: `https://api.overwatchleague.com/live-match`,
        json: true
    });
    let status = liveMatchBody.data.liveMatch.status;
    let firstTeamName = liveMatchBody.data.liveMatch.competitors[0].name;
    let secondTeamName = liveMatchBody.data.liveMatch.competitors[1].name;
    if (!status || !firstTeamName || !secondTeamName) throw "getLiveMatch: missing data";
    return { status, firstTeamName, secondTeamName };
}