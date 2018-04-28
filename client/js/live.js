var roster;
var weights;


$(document).ready(function () {

    insertTwitchEmbed();

    getRecentLiveFeed();

    setInterval(function () {
        pollLiveStats();
    }, 1000);

    $("#live-video-toggle-button").on("change", function(e) {
        var checked = document.getElementById("live-video-toggle-button").checked;
        console.log(checked);
        if (checked) {
            insertTwitchEmbed();
        } else {
            $(".video-container-inner").remove();
        }
    });

});


function getRecentLiveFeed() {
    $.get("/api/getLiveFeedHistory", function (data) {
        var livefeed = data.feeds;
        var rosterSet = new Set();
        for (var r = 0; r < data.roster.length; r++) {
            rosterSet.add(data.roster[r].player_id);
        }
        roster = rosterSet;
        weights = data.weights;
      for (var i = 0; i < livefeed.length; i++) {
        var uuid = livefeed[i].uuid;
        var killer_id = livefeed[i].killer_id;
        var killer_name = livefeed[i].killer_name;
        var killer_hero = livefeed[i].killer_hero;
        var killer_heroid = livefeed[i].killer_heroid;
        var killer_team_id = livefeed[i].killer_team_id;
        var victim_id = livefeed[i].victim_id;
        var victim_name = livefeed[i].victim_name;
        var victim_hero = livefeed[i].victim_hero;
        var victim_heroid = livefeed[i].victim_heroid;
        var victim_team_id = livefeed[i].victim_team_id;
        var action = livefeed[i].action;
        var map_id = livefeed[i].map_id;
        // if it has no map id, just go with 1. this is just for reference anyways.
        if (!map_id) {
            map_id = 1
        }
        var pointsHighlightCss = "";
        // if user has player in roster, than highlight
        if (roster.has(livefeed[i].killer_id)) {
            pointsHighlightCss = " live-points-highlight'";
        }
        // dont show points for ressurections. we dont calculate those yet
        var points = "<span class='live-points" + pointsHighlightCss + "'> +" + weights[killer_heroid][map_id].toFixed(2) + "</span>";
        if (action === "resurrected") {
            points = "";
        }
        var msgToDisplay = `<img class="live-teampic" src="/images/team_icons/${killer_team_id}.png"> 
            ${killer_name} 
            <img class="live-heropic" src="/images/hero_icons/${killer_heroid}.png">  
             ${action} 
            <img class="live-teampic" src="/images/team_icons/${victim_team_id}.png"> 
            ${victim_name} 
            <img class="live-heropic" src="/images/hero_icons/${victim_heroid}.png">` + points
          $('#live-feed-display').prepend($('<li class="list-group-item" data-uuid="' + uuid + '">').html(msgToDisplay));
      }
      
    })
  }
  
function pollLiveStats() {
    $.get("/api/livestats", function (liveStats) {
        for (var x = 0; x < liveStats.length; x++) {
            var uuid = liveStats[x].uuid;
            // only append items that aren't already present
            var exists = false
            $(".list-group-item").each(function () {
                if (uuid == $(this).data("uuid")) {
                    exists = true
                }
            });
            if (exists === true) {
                continue;
            }
            var map_id = liveStats[x].map_id;
            // if it has no map id, just go with 1. this is just for reference anyways.
            if (!map_id) {
                map_id = 1
            }
            var pointsHighlightCss = "";
            // if user has player in roster, than highlight
            if (roster.has(liveStats[x].killer_player_id)) {
                pointsHighlightCss = " live-points-highlight'";
            }
            // dont show points for ressurections. we dont calculate those yet
            var points = "<span class='live-points" + pointsHighlightCss + "'> +" + weights[liveStats[x].killer_hero_id][map_id].toFixed(2) + "</span>";
            if (liveStats[x].action === "resurrected") {
                points = "";
            }
            var msgToDisplay = `<img class="live-teampic" src="/images/team_icons/${liveStats[x].killer_team_id}.png"> 
            ${liveStats[x].killer_name} 
            <img class="live-heropic" src="/images/hero_icons/${liveStats[x].killer_hero_id}.png">  
             ${liveStats[x].action} 
            <img class="live-teampic" src="/images/team_icons/${liveStats[x].victim_team_id}.png"> 
            ${liveStats[x].victim_name} 
            <img class="live-heropic" src="/images/hero_icons/${liveStats[x].victim_hero_id}.png">` + points
            $('#live-feed-display').prepend($('<li class="list-group-item" data-uuid="' + uuid + '">').html(msgToDisplay));
        }
        liveStats = null;
    });
}

function insertTwitchEmbed() {
    var videoHtml = `
            <div class="video-container-inner">
                <div class="twitch-container">
                    <div id="twitch-embed">
                        <div id="live-resize-highlighter" hidden>
                        </div>
                    </div>
                </div>
                <h2 id="live-resize-info-text" hidden>Window is resizable</h2>
                <h2 id="live-mobile-info-text" hidden>On Mobile, tap to "pause" and then "play" again</h2>
            </div>
            `
    $(".video-container").html(videoHtml);
    var embed = new Twitch.Player("twitch-embed", {
        width: 600,
        height: 340,
        channel: "overwatchleague"
    });
    // if mobile
    if (screen.width < 768) {
        $("#live-mobile-info-text").show();
        setTimeout(function () {
            $("#live-mobile-info-text").remove();
        }, 3000);
        // if not mobile
    } else {
        $("#live-resize-highlighter").show();
        $("#live-resize-info-text").show();
        setTimeout(function () {
            $("#live-resize-highlighter").remove();
            $("#live-resize-info-text").remove();
        }, 3000);
    }
    var twitchContainer = $(".twitch-container");
    if ($(window).width() > 640) {
        twitchContainer.height(370);
        twitchContainer.width(640);
    }
    window.onresize = resize;
    setInterval(function () {
        resize();
    }, 200);
    function resize() {
        w = twitchContainer.width();
        h = twitchContainer.height();
        embed.setWidth(w * .98);
        embed.setHeight(w * 9 / 16 * .98);
    }
}