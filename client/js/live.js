
$(document).ready(function () {

    setInterval(function() {
        pollLiveStats();
    }, 1000);

    var embed = new Twitch.Player("twitch-embed", {
        width: 600,
        height: 340,
        channel: "overwatchleague"
    })
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
    

    getRecentLiveFeed();
})


function getRecentLiveFeed() {
    $.get("/api/getLiveFeedHistory", function (livefeed) {
      for (var i = 0; i < livefeed.length; i++) {
        var uuid = livefeed[i].uuid;
        var killer_id = livefeed[i].killer_id;
        var killer_name = livefeed[i].killer_name;
        var killer_hero = livefeed[i].killer_hero;
        var killer_heroid = livefeed[i].killer_heroid;
        var victim_id = livefeed[i].victim_id;
        var victim_name = livefeed[i].victim_name;
        var victim_hero = livefeed[i].victim_hero;
        var victim_heroid = livefeed[i].victim_heroid;
        var action = livefeed[i].action;
        var msgToDisplay = `${killer_name} 
        <img class="live-playerpic" src="/images/player_headshots/${killer_id}.png" >
<<<<<<< HEAD
        with ${killer_hero} 
        <img class="live-playerpic" src="/images/hero_icons/${killer_heroid}.png" >
        ${action} 
        ${victim_name} 
        <img class="live-playerpic" src="/images/player_headshots/${victim_id}.png" >
        with ${victim_hero}
        <img class="live-playerpic" src="/images/hero_icons/${victim_heroid}.png" >
        `
        console.log(msgToDisplay); 
        $('#live-feed-display').prepend($('<li class="list-group-item">').html(msgToDisplay));
=======
        with ${killer_hero} ${action} ${victim_name} with ${victim_hero}`
        $('#live-feed-display').prepend($('<li class="list-group-item" data-uuid="' + uuid + '">').html(msgToDisplay));
>>>>>>> origin/master
      }
      
    })
  }
  
function pollLiveStats() {
    $.get("/api/livestats", function (liveStats) {
        for (var x = 0; x < liveStats.length; x++) {
            var alreadyExists = false;
            var liveStat = liveStats[x];
            var uuid = liveStat.uuid;
            var killer_id = liveStat.killer_id;
            var killer_name = liveStat.killer_name;
            var killer_hero = liveStat.killer_hero;
            var victim_id = liveStat.victim_id;
            var victim_name = liveStat.victim_name;
            var victim_hero = liveStat.victim_hero;
            var action = liveStat.action;
            var msgToDisplay = `${killer_name} 
            with ${killer_hero} ${action} ${victim_name} with ${victim_hero}`
            $(".list-group-item").each(function() {
                if (uuid == $(this).data("uuid")) {
                    alreadyExists = true;
                }
            });
            if (!alreadyExists) {
                $('#live-feed-display').prepend($('<li class="list-group-item" data-uuid="' + uuid + '">').html(msgToDisplay));
            }
        }
    });
}