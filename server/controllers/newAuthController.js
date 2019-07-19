const strings = require(`../utils/strings.js`);
const regex = require(`../utils/regex.js`);
const models = require(`../models`);
const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const base64url = require('base64url');
const saltRounds = 12;
const tokenAge = 2592000000;

function login(req, res) {
    const username = req.body.username;
    const password = req.body.password;
    if (!regex.isUsername(username)) {
        return res.status(400).json({
            message: strings.invalidUsername
        });
    }
    if (!regex.isPassword(password)) {
        return res.status(400).json({
            message: strings.invalidPassword
        });
    }
    return res.status(200).json({
        hey: "hey"
    });
    // models.getUserFromUsername([username])
    // .then(userObject => {
    //     if (userObject.length < 1) { // create account
    //         bcrypt.hash(password, saltRounds, function (error, hash) {
    //             if (error) {
    //                 console.error(error);
    //                 return res.status(500).json({
    //                     message: strings.unknownError
    //                 });
    //             }
    //             models.createUser([username, hash])
    //             .then(newUserObject => {
    //                 const newAuthToken = base64url(crypto.randomBytes(30));
    //                 const userId = newUserObject.insertId;
    //                 const expiresEpoch = Date.now() + tokenAge;
    //                 models.createAuthToken([userId, newAuthToken, expiresEpoch])
    //                 .then(() => {
    //                     return res.status(200).json({
    //                         data: {
    //                             token: newAuthToken,
    //                             userId: userId,
    //                             username: username
    //                         }
    //                     });
    //                 }).catch(error => {
    //                     console.error(error);
    //                     return res.status(500).json({
    //                         message: strings.unknownError
    //                     });
    //                 });
    //             }).catch(error => {
    //                 console.error(error);
    //                 return res.status(500).json({
    //                     message: strings.unknownError
    //                 });
    //             });
    //         });
    //     } else { // login
    //         const hash = userObject[0].password;
    //         const userId = userObject[0].user_id;
    //         const username = userObject[0].username;
    //         bcrypt.compare(password, hash, function (error, result) {
    //             if (error) {
    //                 console.error(error);
    //                 return res.status(500).json({
    //                     message: strings.unknownError
    //                 });
    //             }
    //             if (result == true) {
    //                 const newAuthToken = base64url(crypto.randomBytes(30));
    //                 const expiresEpoch = Date.now() + tokenAge;
    //                 models.createAuthToken([userId, newAuthToken, expiresEpoch])
    //                 .then(() => {
    //                     return res.status(200).json({
    //                         data: {
    //                             token: newAuthToken,
    //                             userId: userId,
    //                             username: username
    //                         }
    //                     });
    //                 }).catch(error => {
    //                     console.error(error);
    //                     return res.status(500).json({
    //                         message: strings.unknownError
    //                     });
    //                 });
    //             } else {
    //                 return res.status(400).json({
    //                     message: strings.invalidLogin
    //                 });
    //             }
    //         });
    //     }
    // }).catch(error => {
    //     console.error(error);
    //     return res.status(500).json({
    //         message: strings.unknownError
    //     });
    // });
}

// function token(req, res) {
//     const token = req.body.token;
//     models.getAuthTokenFromToken([token])
//     .then(data => {
//         const expiresEpochCheck = data[0].expires_epoch;
//         const userId = data[0].user_id;
//         const username = data[0].username;
//         if (expiresEpochCheck < Date.now()) {
//             return res.status(400).json({
//                 message: strings.expiredToken
//             });
//         }
//         const newAuthToken = base64url(crypto.randomBytes(30));
//         const expiresEpoch = Date.now() + tokenAge;
//         models.createAuthToken([userId, newAuthToken, expiresEpoch])
//         .then(data => {
//             return res.status(200).json({
//                 data: {
//                     token: newAuthToken,
//                     userId: userId,
//                     username: username
//                 }
//             });
//         }).catch(error => {
//             console.error(error);
//             return res.status(500).json({
//                 message: strings.unknownError
//             });
//         });
//     }).catch(error => {
//         console.error(error);
//         return res.status(500).json({
//             message: strings.unknownError
//         });
//     });
// }


module.exports = {
    login,
    // token
};
