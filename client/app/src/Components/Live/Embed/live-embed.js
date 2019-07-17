import React, { Component } from 'react';
import "./live-embed.scss";

class LiveEmbed extends Component {
  constructor() {
    super();
    this.state = {
      showInfoText: false,
      showMobileInfoText: false,
      showHighlighter: false,
      embed: null,
      showVideo: true,
      embeddedTwitch: false
    };
    this.intervals = [];
    this.onResize = this.onResize.bind(this);
    this.handleVideoToggleButtonClick = this.handleVideoToggleButtonClick.bind(this);
  }

  componentDidMount() {
    window.addEventListener("resize", this.onResize);
    const embed = new window.Twitch.Player("twitch-embed", {
        width: 600,
        height: 340,
        channel: "overwatchleague"
    });
    this.setState({embeddedTwitch: true, embed: embed});
    // if mobile
    if (window.screen.width < 768) {
        this.setState({showMobileInfoText: true});
        this.intervals.push(setTimeout(function () {
          this.setState({showMobileInfoText: false});
        }, 3000));
    // if not mobile
    } else {
      this.setState({showInfoText: true, showHighlighter: true});
        this.intervals.push(setTimeout(function () {
            this.setState({showInfoText: false, showHighlighter: false});
  
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

  componentDidUpdate() {
    if (!this.state.embeddedTwitch) {
      const embed = new window.Twitch.Player("twitch-embed", {
        width: 600,
        height: 340,
        channel: "overwatchleague"
      });
      this.setState({embeddedTwitch: true, embed: embed });
    }
  }

  onResize() {
    const twitchCont = document.getElementsByClassName("twitch-container")[0];
    if (twitchCont) {
      const w = twitchCont.offsetWidth;
      this.state.embed.setWidth(w * .98);
      this.state.embed.setHeight(w * 9 / 16 * .98);
    }
  }

  handleVideoToggleButtonClick() {
    if (!this.state.showVideo) this.setState({embeddedTwitch: false});
    this.setState(prevState => ({ showVideo: !prevState.showVideo}));
  }

  render() {
    return (
      <div>
        {this.state.showVideo && <div>
          <div className="twitch-container">
            <div id="twitch-embed">
              {this.state.showHighlighter && <div id="live-resize-highlighter"></div>}
            </div>
          </div>
          {this.state.showInfoText && <h2 id="live-resize-info-text">Window is resizable</h2>}
          {this.state.showMobileInfoText && <h2 id="live-mobile-info-text">On Mobile, tap to "pause" and then "play" again</h2>}
        </div>}
        <button className="btn btn-primary" onClick={this.handleVideoToggleButtonClick}>{this.state.showVideo ? "Hide Stream" : "Show Stream"}</button>
      </div>
    )
  }
}
export default LiveEmbed;
