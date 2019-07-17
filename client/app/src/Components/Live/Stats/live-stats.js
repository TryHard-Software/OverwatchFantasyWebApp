import React, { Component } from 'react';
import axios from 'axios';
import './live-stats.scss';

class LiveStats extends Component {
  constructor() {
    super();
    this.state = {
      isLoggedIn: true,
      roster: [],
      weights: [],
      livefeeds: []
    };
    this.hasUnmounted = false;
    this.livefeedSet = new Set();
    this.intervals = [];
    this.getRecentLiveFeed = this.getRecentLiveFeed.bind(this);
    this.pollLiveStats = this.pollLiveStats.bind(this);
  }

  async componentDidMount() {
    await this.getRecentLiveFeed();

    this.intervals.push(setInterval(function () {
        this.pollLiveStats();
    }.bind(this), 1000));
  }

  componentWillUnmount() {
    this.hasUnmounted = true;
    for (const interval of this.intervals) {
      clearInterval(interval);
    }
  }

  async getRecentLiveFeed() {
    let data;
    try {
      const resp = await axios.get("/api/getLiveFeedHistory");
      data = resp.data;
    } catch (error) {
      console.error(error);
    }
    if (this.hasUnmounted || !data) return;
    const livefeeds = data.feeds;
    const weights = data.weights;
    const rosterSet = new Set();
    const roster = data.roster;
    for (const rosterItem of roster) {
      rosterSet.add(rosterItem.player_id);
    }
    for (const livefeedItem of livefeeds) {
      this.livefeedSet.add(livefeedItem.uuid);
    }
    this.setState({roster: rosterSet});
    this.setState({weights});
    this.setState({livefeeds});
  }

  async pollLiveStats() {
    let liveStats;
    try {
      const resp = await axios.get("/api/livestats");
      liveStats = resp.data;
    } catch (error) {
      console.error(error);
    }
    if (this.hasUnmounted || !liveStats) return;
    for (const liveStatsItem of liveStats) {
      const uuid = liveStatsItem.uuid;
      if (!this.livefeedSet.has(uuid)) {
        this.livefeedSet.add(uuid);
        this.setState(prevState => ({ livefeeds: [liveStatsItem, ...prevState.livefeeds] }));
      }
    }
  }

  render() {
    return (
      <div id="live-feed">
        <div>
          {this.state.isLoggedIn ? <h2>Live Stats</h2> : <h2>Log In To See Your Live Point Gains</h2>}
        </div>
        <div id="live-feed-body">
            <ul className="list-group" id="live-feed-display">
              {this.state.livefeeds.map(livefeedItem => 
                <li className="list-group-item" key={livefeedItem.uuid} data-uuid={livefeedItem.uuid}>
                  <img className="live-teampic" alt="team" src={`/images/team_icons/${livefeedItem.killer_team_id}.png`} /> 
                  {livefeedItem.killer_name} 
                  <img className="live-heropic" alt="hero" src={`/images/hero_icons/${livefeedItem.killer_hero_id}.png`} />  
                  {livefeedItem.action} 
                  <img className="live-teampic" alt="team" src={`/images/team_icons/${livefeedItem.victim_team_id}.png`} /> 
                  {livefeedItem.victim_name} 
                  <img className="live-heropic" alt="hero" src={`/images/hero_icons/${livefeedItem.victim_hero_id}.png`} />
                  <span className={this.state.roster.has(livefeedItem.killer_id) ? `live-points live-points-highlight` : `live-points`}>{this.state.weights[livefeedItem.killer_hero_id][livefeedItem.map_id] ? this.state.weights[livefeedItem.killer_hero_id][livefeedItem.map_id].toFixed(2) : this.state.weights[livefeedItem.killer_hero_id][1].toFixed(2)}</span>
                </li>
              )}
            </ul>
        </div>
      </div>
    )
  }
}
export default LiveStats;
