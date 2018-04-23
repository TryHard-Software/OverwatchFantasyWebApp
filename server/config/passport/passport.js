//load bcrypt
var bCrypt = require('bcrypt-nodejs');
var RememberMeStrategy = require('passport-remember-me').Strategy;
var db = require('../../models');

module.exports = function (passport) {
    var LocalStrategy = require('passport-local').Strategy;
    //serialize
    passport.serializeUser(function (user, cb) {
        cb(null, user.id);
    });

    // deserialize user 
    passport.deserializeUser(function (id, done) {
        db.findOneRowWithId("users", id, function (err, rows) {
            if(err)
            {
                console.log(err);
                return;
            }
            done(err, rows);
        })
    })

    passport.use('local-signup', new LocalStrategy(
        {
            usernameField: 'username',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass back the entire request to the callback
        },

        function (req, username, password, done) {
            var generateHash = function (password) {
                return bCrypt.hashSync(password, bCrypt.genSaltSync(8), null);
            };
            // this regex keeps username between 3 and 14 chars (you add 2 for some reason)
            // it also prevents all sorts of bad usernames
            var reg = /^[a-zA-Z0-9]([._](?![._])|[a-zA-Z0-9]){1,12}[a-zA-Z0-9]$/;
            if (!reg.test(req.body.username)) {
                return done(null, false, req.flash('signupMessage', 'Invalid username.'));
            }
            db.findOneRowWithColumn1OrColumn2("users", "username", "email", username.toLowerCase(), req.body.email.toLowerCase(), 
                function (error, user) {
                if (user) {
                    return done(null, false, req.flash('signupMessage', 'A user already exists with that username or E-Mail.'));
                } else {
                    var userPassword = generateHash(password);
                    var data = {
                        username: username,
                        password: userPassword,
                        email: req.body.email,
                        access_level: 2
                    };
                    db.insert("users", data, function(error, newUser) {
                        if (error) {
                            console.log(error);
                            return;
                        }
                        if (!newUser) {
                            return done(null, false,
                                req.flash('signupMessage', 'Failed creating user. Check that your fields are valid before submitting them. '));
                        }

                        if (newUser) {
                            data.id = newUser.insertId; 
                            return done(null, data);
                        }
                    });
                }
            });
        }
    ));

    //LOCAL SIGNIN
    passport.use('local-signin', new LocalStrategy(

        {
            usernameField: 'username',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass back the entire request to the callback
        },

        function (req, username, password, done) {
            //var User = user;
            var isValidPassword = function (userpass, password) {
                return bCrypt.compareSync(password, userpass);
            }
            
            db.findOneRowWithColumn1OrColumn2("users", "username", "email", username.toLowerCase(), username.toLowerCase(), 
                function (error, user) {
                    if(error){
                        return done(null, false,
                            req.flash('loginMessage', 'Something went wrong with your Log-In. '));
                    }
                    if (!user) {
                        return done(null, false,
                            req.flash('loginMessage', 'Username does not exist. '));
                    }
                    if (!isValidPassword(user.password, password)) {
                        return done(null, false,
                            req.flash('loginMessage', 'Incorrect Password.'));
                    }
                    //var userinfo = user.get();
                    return done(null, user);
            });
        }
    ));

    //remember me token
    passport.use(new RememberMeStrategy(
        function (token, done) {
            Token.consume(token, function (err, user) {
                if (err) { return done(err); }
                if (!user) { return done(null, false); }
                return done(null, user);
            });
        },
        function (user, done) {
            var token = utils.generateToken(64);
            Token.save(token, { userId: user.id }, function (err) {
                if (err) { return done(err); }
                return done(null, token);
            });
        }
    ));
}