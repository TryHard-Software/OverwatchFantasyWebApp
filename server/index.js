
var express = require("express");
var bodyParser = require("body-parser");
var path = require('path');
var crashreporter = require('crashreporter');
var passport = require('passport');
var session = require('express-session');
var exphbs = require('express-handlebars');
var cookieParser = require('cookie-parser')
var flash = require("connect-flash");
var db = require('./models');
var logger = require("morgan");
var moment = require('moment');
const cors = require('cors');

export default path => {

    var app = express();

    var server = require('http').Server(app);
    var io = require('socket.io')(server);

    //chat module. server socket to persist connection
    io.on('connection', function (socket) {
        console.log('user connected');
        socket.on('chat message', function (msg) {
            io.sockets.emit('chat message', msg);
        });
        socket.on('disconnect', function () {
            //console.log('user disconnected');
        });
    });

    require('crashreporter').configure({
        outDir: "./logs/",
        exitOnCrash: false,
        maxCrashFile: 5
    });

    app.use(cors());

    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(express.static(`${path}/client`));

    //Passport
    app.use(session({
        secret: process.env.PASSPORT_SECRET,
        resave: true,
        saveUninitialized: true,
        cookie: {
            maxAge: 2592000000 //
        },
    })); // session secret

    app.use(cookieParser());
    app.use(passport.initialize());
    app.use(passport.session()); // persistent login sessions
    app.use(passport.authenticate('remember-me')); //remember me token
    app.use(flash()); //flash messages

    //var db = require("./models");

    app.use(function (req, res, next) {
        if (req.user) {
            res.locals.loggedIn = true;
            res.locals.username = req.user.username;
        } else {
            res.locals.loggedIn = false;
        }
        next();
    });

    // redirect to https unless we're on localhost
    app.get("*", function (req, res, next) {
        //Heroku stores the origin protocol in a header variable. The app itself is isolated within the dyno and all request objects have an HTTP protocol.
        if (req.get('X-Forwarded-Proto') == 'https' || req.hostname == 'localhost') {
            //Serve App by passing control to the next middleware
            next();
        } else if (req.get('X-Forwarded-Proto') != 'https' && req.get('X-Forwarded-Port') != '443') {
            //Redirect if not HTTP with original request URL
            res.redirect('https://' + req.hostname + req.url);
        }
    });

    var mainRoutes = require('./routes/mainRoutes.js')(app, passport);
    var apiRoutes = require("./routes/apiRoutes.js")(app, passport);
    var adminRoutes = require("./routes/adminRoutes.js")(app, passport);
    var authRoutes = require('./routes/authRoutes.js')(app, passport);
    var newAuthRoutes = require('./routes/newAuthRoutes.js')(app);
    var dashboardRoutes = require('./routes/dashboardRoutes.js')(app, passport);

    require('./config/passport/passport.js')(passport);

    app.use("/api", apiRoutes);
    app.use("/admin", adminRoutes);
    app.use("/dashboard", dashboardRoutes);
    app.use("/auth", newAuthRoutes);

    //For Handlebars
    app.set('views', `${path}/server/views`);
    app.engine('hbs', exphbs({
        extname: '.hbs',
        defaultLayout: "main",
        layoutsDir: `${path}/server/views/layouts`,
        partialsDir: [
            `${path}/server/views/partials`,
        ],
        helpers: {
            inc: function (value, options) {
                return parseInt(value) + 1;
            },
            formatDate: function(datetime)
            {
                if(moment) { 
                    return moment(datetime).format("LLLL");
                }
            },
            winOrLoss: function(teamId, winningId)
            {
                return teamId === winningId ? "WIN" : "LOSS"
            }
        }
    }));

    app.set('view engine', '.hbs');

    // react
    app.get("/app/*", (req, res) => {
        res.sendFile(`${path}/client/app/index.html`);
    });

    app.get("*", function (req, res) {
        res.render("notfound");
    });

    return server;
};
