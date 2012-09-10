module.exports = function setup(options, imports, register) {

    var express = require('express'),
        app = express(),
        http = require('http'),
        server = http.createServer(app),
        SQLiteStore = require('connect-sqlite')(express),
        //pam = require('authenticate-pam'),
        //io = require('socket.io').listen(server),
        util = require('util'),
        crypto = require('crypto');

    var port = options.port || 3000,
        host = options.host || "0.0.0.0";

    // Setup Random Session Secret
    // Notes: with this approach each time
    // the agent/node app is restarted all
    // sessions will become invalid.
    //
    // Todo: consider approaches that perserve
    // sessions across restarts. Maybe use keygrip
    // and store last x keys somewhere.
    var sessionSecret;
    try {
        sessionSecret = crypto.randomBytes(24).toString('hex');
    } catch (ex) {
        console.log('error generating random session secret'); // Todo: integrate this with logging (winston)
    }

    // XSS Middleware
    // Notes: Experimenting with this approach
    // and other ways to increase security of
    // sensitive operations.
    var xssHeader = function(req, res, next) {
        if(req.session !== undefined) {
            res.header('X-CSRF-Token', req.session._csrf ? req.session._csrf : '');
        }
        next();
    };

    // App Configuration
    app.configure(function() {
        app.use(express.bodyParser());
        app.use(express.cookieParser());
        app.use(express.session({
            store: new SQLiteStore({db:'usgDB', dir:'db/'}),
            key:'usgagent.sid',
            secret: sessionSecret,
            cookie: {maxAge:86400 * 7, secure: false, signed: true, httpOnly: true}
        }));
        app.use(express.csrf());
    });

    function ensureAuthenticated(req, res, next) {
        if(req.session.authenticated !== undefined && req.session.authenticated === true) {
            req.session.count = req.session.count ? (req.session.count + 1) : 1;

            req.session.save(function(err) {
                if(err) {
                    console.log('error saving session'); // Todo: log this into an error log for support/debugging
                }
            });
            return next();
        }
        else {
            res.json({success:false, msg: 'Login required'}, 401);
        }
    }

    server.listen(port, host, function (err) {
        if (err) return register(err);
        console.log("HTTP server listening on http://%s%s/", options.host || "localhost", ":" + port);
        register(null, {
            // When a plugin is unloaded, it's onDestruct function will be called if there is one.
            onDestruct: function (callback) {
                server.close(callback);
            },
            http: app
        });
    });

};