import React from 'react';
import './information-view.scss';
export default props =>
<html class="bg-wrapper information-bg">
<div class="container-dashboard">
    <div class="col-md-8 col-md-offset-2 col-sm-10 col-sm-offset-1 col-xs-12">
        <div class="panel panel-default panel-transparent">
            <div class="panel-heading">
                <h3>Information</h3>
            </div>
            <div class="panel-body">
                <h2>Global League Rules</h2>
                <p class="news-text">Rosters will be locked from Wednesday at 4pm PDT - Saturday at 8pm PDT
                    (Sunday on finals week).</p>
                    
                <p class="news-text">You will not be able to switch out any players until the roster unlocks again.
                    All of your players award you points for every game they play.</p>
                <p class="news-text"> You many add any player to your roster. There will be weekly, stage, and seasonal leaderboards.</p>
            </div>
            <div class="panel-body">
                <h2>Global League Scoring</h2>
                <p class="news-text">You will receive a certain number of points when any one of your players performs
                    a final blow. You will not be penalized for deaths. All kills are weighted based upon the current
                    map and the hero who performed the kill. 
                    </p>
                <p class="news-text">In other words, a mercy will recieve more points for a final
                    blow than pharah, and Pharah will recieve less points for kills on Lijiang Tower. This scoring system
                    rewards unique plays and aggressive strategies while maintaining balance between the classes. 
                    </p>
                    <p class="news-text">There will soon
                    be achievements that will award points every week focusing on metrics such as deaths, ultimates,
                    and map wins. These bonus achievements are coming soon... The points each player awards you over time
                    will appear on your dashboard.
                </p>
            </div>
            <div class="panel-body">
                <h2>Personal League Rules</h2>
                <p class="news-text">This is where the real fun comes in. Live drafts, trades, auctions, subs, chat, etc. Coming soon...</p>
            </div>
        </div>
    </div>
</div>

</html>