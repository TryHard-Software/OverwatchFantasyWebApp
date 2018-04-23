var PORT = process.env.PORT || 3001; // Sets an initial port. We'll use this later in our listener
// ensure environment variables are loaded
import App from './server'

// Requiring our models for syncing
//import db from './server/models/index.js';

const app = App(__dirname);

app.listen(PORT, function() {
  console.log('App listening on PORT: ' + PORT);
  defaultActions();
});

var timers = require(__dirname + `/server/timers`);
var adminController = require(__dirname + `/server/controllers/adminController`);


function defaultActions() {
  if (process.env.NODE_ENV === "production") {
    adminController.playerPics();
  }
  // ping self every 14 minutes so herokuapp doesn't idle
  timers.startPingSelf(14);
  // seed leaderboard every 24 hours
  timers.seedDbLeaderboard(60 * 24);
  // seed weekly leaderboard every 24 hours. offset by 10 minutes.
  setTimeout(function () {
    timers.seedDbWeeklyLeaderboard(60 * 24);
  }, 1000 * 60 * 10);
};