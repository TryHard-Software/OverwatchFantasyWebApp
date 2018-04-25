
$(document).ready(function () {

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
})

