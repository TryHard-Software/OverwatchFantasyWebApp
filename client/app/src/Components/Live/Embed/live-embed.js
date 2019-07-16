import React, { Component } from 'react';

class LiveEmbed extends Component {
  constructor() {
    super();
    this.state = {
      showInfoText: false,
      showMobileInfoText: false,
      showHighlighter: false,
      embed: null
    };
    this.intervals = [];
    this.onResize = this.onResize.bind(this);
  }

  componentDidMount() {
    window.addEventListener("resize", this.onResize);
    const embed = new window.Twitch.Player("twitch-embed", {
        width: 600,
        height: 340,
        channel: "overwatchleague"
    });
    this.setState({embed});
    // if mobile
    if (window.screen.width < 768) {
        this.setState({showMobileInfoText: true});
        this.intervals.push(setTimeout(function () {
          this.setState({showMobileInfoText: false});
        }, 3000));
    // if not mobile
    } else {
      this.setState({showInfoText: true});
      this.setState({showHighlighter: true});
        this.intervals.push(setTimeout(function () {
            this.setState({showInfoText: false});
            this.setState({showHighlighter: false});
        }.bind(this), 3000));
    }
    const twitchCont = document.getElementsByClassName("twitch-container")[0];
    if (window.screen.dith > 640) {
      twitchCont.style.height = 370;
      twitchCont.style.width = 640;
    }
    this.intervals.push(setInterval(function () {
        this.onResize();
    }.bind(this), 200));
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.onResize);
    for (const interval of this.intervals) {
      clearInterval(interval);
    }
  }

  onResize() { // this is running even after page change. not okay.
    const twitchCont = document.getElementsByClassName("twitch-container")[0];
    if (twitchCont) {
      const w = twitchCont.offsetWidth;
      this.state.embed.setWidth(w * .98);
      this.state.embed.setHeight(w * 9 / 16 * .98);
    }
  }

  render() {
    return (
      <div>
        <div className="twitch-container">
          <div id="twitch-embed">
            {this.state.showHighlighter && <div id="live-resize-highlighter"></div>}
          </div>
        </div>
        {this.state.showInfoText && <h2 id="live-resize-info-text">Window is resizable</h2>}
        {this.state.showMobileInfoText && <h2 id="live-mobile-info-text">On Mobile, tap to "pause" and then "play" again</h2>}
        {/* <div class="checkbox">
            <span id="live-video-toggle-label">Video</span>
            <label>
                <input id="live-video-toggle-button" checked type="checkbox" data-toggle="toggle" />
            </label>
        </div> */}
      </div>
    )
  }
}
export default LiveEmbed;
