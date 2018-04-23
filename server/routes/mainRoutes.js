var mainController = require('../controllers/mainController.js');

module.exports = function (app, passport) {

    app.get('/leaderboard', mainController.leaderboard);

    app.get('/leaderboard_weekly', mainController.weeklyLeaderboard);

    app.get('/about', mainController.about);

    app.get('/home', mainController.home);

    app.get('/information', mainController.information);

    app.get('/news', mainController.news);

    app.get('/live', mainController.live);

    app.get('/tutorial', mainController.tutorial);

    //when you hit / it should redirect to a dashboard when logged in.
    //otherwise direct me to the landingpage 
    app.get('/', redirectToLandingPageWhenUserIsLoggedIn, function(req, res) {
        res.redirect("/dashboard");
    });

    //send report submissions
    app.post('/sendreport', mainController.sendreport); 

    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated())
            return next();
        res.redirect('/signin');
    }

    function redirectToLandingPageWhenUserIsLoggedIn(req, res, next) {
        if (req.isAuthenticated())
            return next();
        res.redirect('/home');
    }

}