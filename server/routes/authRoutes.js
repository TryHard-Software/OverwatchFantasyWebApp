var authController = require('../controllers/authController.js');

module.exports = function (app, passport) {

    app.get('/signup', authController.signup);

    app.get('/signin', authController.signin);

    app.get('/logout', authController.logout);

    app.get('/forgot', authController.forgot);

    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/dashboard',
        failureRedirect: '/signup',
        failureFlash: true
    }
    ));

    app.post('/signin', passport.authenticate('local-signin', {
        successRedirect: '/dashboard',
        failureRedirect: '/signin',
        failureFlash: true
    }),
        function (req, res) {
            if (req.body.remember) {
                req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // Cookie expires after 30 days
            } else {
                req.session.cookie.expires = false; // Cookie expires at end of session
            }
            res.redirect('/dashboard');
        }
    )

    app.post('/forgot', authController.forgotPassword);

    app.get('/reset/:token', authController.resetPassword); //makes sure reset token is valid (hasnt expired yet)

    app.post('/reset/:token', authController.finalizeResetPassword); //submit form for reset token 

}