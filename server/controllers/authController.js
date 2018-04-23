
var crypto = require('crypto');
var async = require('async');
var db = require('../models');
var sgMail = require('@sendgrid/mail');
var moment = require('moment'); 
var bCrypt = require('bcrypt-nodejs');

var exports = module.exports = {}

exports.signup = function (req, res) {
    res.render('signup', { message: req.flash('signupMessage') });
};

exports.signin = function (req, res) {
    res.render('signin', { message: req.flash('loginMessage'), resetComplete: req.flash('resetComplete') });

};

exports.forgotPassword = function (req, res, next) {
    async.waterfall([
        function (done) {
            crypto.randomBytes(20, function (err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function (token, done) {
            var constraint = {
                email: req.body.email
            }
            db.findOneWithConstraint("users", constraint, "", function(err, user) {
                if(err) 
                {
                    return done(err);
                }
                if (!user) {
                    return done(null,false,
                        req.flash('forgotError', 'The E-Mail does not exist.'));
                }
                var updatedUserFields = {
                    resetPasswordToken: token,
                    resetPasswordExpires: moment(Date.now() + 3600000).format('YYYY-MM-DD HH:mm:ss') //token expires in 1 hour
                }
                var constraint = { 
                    id: user.id
                }
                db.update("users", updatedUserFields, constraint, function (err, result) { 
                    done(err, token, user);
                });
            })
        },
        function (token, user, done) {
        db.findOneRowWithId("users", user.id, function (err, found) {
            if(err) 
            {
                return done(err, null);
            }
            if(!found){
                return done(null, "user not found");
            }
            var email = found.email; 
            sgMail.setApiKey(process.env.SENDGRID_API_KEY);
            const msg = {
                to: email,
                from: "OverwatchFantasy@tutanota.com",
                subject: 'Overwatch Fantasy League Password Reset',
                text: "You are receiving this E-Mail because you (or someone else) has requested to reset your account's password.\n\n" +
                    "Please click on the following link, or paste it in your browser's address bar to complete the process:\n\n" +
                    'https://' + req.headers.host + '/reset/' + token + '\n\n' +
                    'If you did not request this, please ignore this email.\n'
            };
                
            sgMail.send(msg).then(function (err, results) {
                req.flash('forgotInfo', 'An e-mail has been sent to ' + email + ' with further instructions.');
                done();
            });
        })
    }
    ], function (err) {
        if (err) 
        {
            console.log(err);
            return next(err);
        }
        res.redirect('/forgot');
    });
};

exports.resetPassword = function(req, res) {
    var query = `SELECT * FROM ?? WHERE 
                 ?? = ? AND  
                 ?? > ?`
    var values = ["users", 
                 "resetPasswordToken", req.params.token, 
                 "resetPasswordExpires", moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')]
    db.customizedQuery(query, values, function(error, user){
        if(error) 
        {
            console.log(error);
            return;
        }
        if (user.length == 0) {
          req.flash('forgotError', 'Password reset token is invalid or has expired.');
          return res.redirect('/forgot');
        }
        res.render('reset', {
          user: req.user, 
          message: { 
              error: req.flash('forgotError'),
              info: req.flash('forgotInfo'),
              success: req.flash('forgotSuccess')
          }
        });
      });
    
}

exports.finalizeResetPassword = function(req, res) {
    async.waterfall([
        function(done) {
            var query = `SELECT * FROM ?? WHERE 
                         ?? = ? AND  
                         ?? > ?`
            var values = ["users", 
                         "resetPasswordToken", req.params.token, 
                         "resetPasswordExpires", moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')]
            db.customizedQuery(query, values, function(error, results){
            if(error)
                {
                    console.log(error); 
                    return;
                }
            if (results.length == 0) {
              req.flash('forgotError', 'Password reset token is invalid or has expired.');
              return res.redirect('back');
            }  
            var user = results[0];
            var password = req.body.password; 
            var confirmPassword = req.body.confirmPassword;
            if(password !== confirmPassword)
            {
                req.flash('forgotError', 'Passwords do not match. ');
                return res.redirect('back');
            }
            var generateHash = function (password) {
                return bCrypt.hashSync(password, bCrypt.genSaltSync(8), null);
            };

            var sql = `UPDATE ?? SET 
                      ?? = ?,
                      ?? = NULL, 
                      ?? = NULL,
                      ?? = ?
                      WHERE
                      ?? = ?`

            var values = ["users", 
                        "password", generateHash(password),
                        "resetPasswordToken", 
                        "resetPasswordExpires", 
                        "updatedAt", moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'), 
                        "id", user.id];
            //db.update("users", updateVals, constraint, function(error, result){
            db.customizedQuery(sql, values, function(error,result) {
                if(error)
                {
                    req.flash('forgotError', 'Please select a valid password. ');
                    return res.redirect('back');
                }
                done(error, user);
              });
            });
        },
        function(user, done) {
            sgMail.setApiKey(process.env.SENDGRID_API_KEY);
            const msg = {
                to: user.email,
                from: "OverwatchFantasy@tutanota.com",
                subject: 'Your password has been changed',
                text: 'Hello,\n\n' +
                  'This is a confirmation that the password for your account - ' + user.username + ' - has been changed.\n'
            };
                
            sgMail.send(msg).then(function (err, results) {
                req.flash('resetComplete', 'Password Reset Complete! Please log in with your new password! ');
                return res.redirect('/signin');
            });
        }
      ], function(err) {
        res.redirect('back');
      });
}

exports.logout = function (req, res) {
    req.session.destroy(function (err) {
        res.redirect('/');
    });
};

exports.forgot = function (req, res) {
    res.render('forgot', {
        message: { 
            error: req.flash('forgotError'),
            info: req.flash('forgotInfo'),
            success: req.flash('forgotSuccess')
        }
    });
};
