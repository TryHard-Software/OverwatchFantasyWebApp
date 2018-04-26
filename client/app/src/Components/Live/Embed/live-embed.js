import React, { Component } from 'react';
// import { withRouter } from 'react-router-dom';
// import organizationApi from '../../../Data/organization-api';
import './live-embed.scss';
//import $ from 'jquery';

class LiveEmbed extends Component {

  componentDidMount() {
    const embed = new window.Twitch.Player("twitch-embed", {
        width: 600,
        height: 340,
        channel: "overwatchleague"
    });
    // if mobile
    if (window.screen.width < 768) {
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
    let twitchContainer = $(".twitch-container");
    if ($(window).width() > 640) {
        twitchContainer.height(370);
        twitchContainer.width(640);
    }
    window.onresize = resize;
    setInterval(function () {
        resize();
    }, 200);
    function resize() {
        const w = twitchContainer.width();
        const h = twitchContainer.height();
        embed.setWidth(w * .98);
        embed.setHeight(w * 9 / 16 * .98);
    }
  }

  render() {
    return (
      <div>
        <div class="twitch-container">
          <div id="twitch-embed">
            <div id="live-resize-highlighter" hidden>
            </div>
          </div>
        </div>
        <h2 id="live-resize-info-text" hidden>Window is resizable</h2>
        <h2 id="live-mobile-info-text" hidden>On Mobile, tap to "pause" and then "play" again</h2>
      </div>
    )
  }
}
export default LiveEmbed;
