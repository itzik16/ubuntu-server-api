module.exports = function setup(options, imports, register) {

    var express = require('express'),
        app = express(),
        http = require('http'),
        connect = require('connect'),
        SQLiteStore = require('connect-sqlite3')(express),
        util = require('util'),
        crypto = require('crypto'),
        pam = require('authenticate-pam'),
        path = require('path');

    options.port || 8890;
    options.host || "0.0.0.0";
    options.key = fs.readFileSync('./ssl/private/usg-key.pem').toString();
    options.cert = fs.readFileSync('./ssl/certs/usg-cert.pem').toString();


    var server = https.createServer(options, app),
        io = require('socket.io').listen(server);

    // Setup Random Session Secret
    // Notes: with this approach each time
    // the agent/node app is restarted all
    // sessions will become invalid.
    //
    // TODO: consider approaches that perserve
    // sessions across restarts. Maybe use keygrip
    // and store last x keys somewhere.
    
    var sessionSecret;
    try {
        sessionSecret = crypto.randomBytes(24).toString('hex');
    } catch (ex) {
        console.log('error generating random session secret'); // Todo: integrate this with logging (winston)
    }
    var cookieParser = express.cookieParser(sessionSecret);
    var localPath = path.dirname(require.main.filename);
    var sessionStore = new SQLiteStore({db:'usgDB', dir: localPath + '/db'});

    // XSS Middleware
    // Notes: Experimenting with this approach
    // and other ways to increase security of
    // sensitive operations.
    /*
    var xssHeader = function(req, res, next) {
        if(req.session !== undefined) {
            res.header('X-CSRF-Token', req.session._csrf ? req.session._csrf : '');
        }
        next();
    };
    */

    var allowCrossDomain = function(req, res, next) {
        res.header('Access-Control-Allow-Credentials', true);
        // obviously this technique isn't secure - need a better way of doing this
        if(req.session !== undefined && req.session.origin !== undefined)
            res.header('Access-Control-Allow-Origin', req.session.origin);
        else
            res.header('Access-Control-Allow-Origin', '*');

        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
        next();
    };

    // App Configuration
    app.configure(function() {
        app.use(express.bodyParser());
        app.use(allowCrossDomain);
        app.use(cookieParser);
        app.use(express.session({
            store: sessionStore,
            key:'usgagent.sid',
            secret: sessionSecret,
            cookie: {maxAge:864000 * 7, secure: true, signed: true, httpOnly: true}
        }));
        //app.use(express.csrf());
    });

    // Socket.io Authorization
    if(app.settings.env !== 'testing') {
        io.configure(function () {
            io.set('authorization', function (data, callback) {
                if (data && data.headers && data.headers.cookie) {
                    cookieParser(data, {}, function(err) {
                        if(err) {
                            return callback('COOKIE_PARSE_ERROR', false);
                        }
                        var sessionId = data.signedCookies['usgagent.sid'];
                        sessionStore.get(sessionId, function(err, session){
                            if(err || !session || !session.auth || !session.auth.loggedIn){
                                console.log('not logged in');
                                callback('NOT_LOGGED_IN', false);
                            }
                            else{
                                data.session = session;
                                callback(null, true);
                            }
                        });
                    });
                } else {
                    return callback('MISSING_COOKIE', false);
                }
            });
        });
    }

    app.post('/authtoken', function(req, res) {
        res.header('Access-Control-Allow-Origin', req.headers.origin);
        req.session.origin = req.headers.origin;
        if(req.body.username !== undefined && req.body.password !== undefined) {
            
            pam.authenticate(req.body.username, req.body.password, function(err) {
                if(err) {
                    res.json(406, {"succes": false});
                }
                else {
                    req.session.authenticated = true;
                    req.session.save();
                    res.json({"success": true});
                }
            });

        } else {
            res.json(400, {"success": false});
        }
    });

    app.get('/status', function(req, res) {
        res.json(200, {success: true});
    });


    io.sockets.on('connection', function (socket) {
        socket.on('status', function (data) {
            socket.emit('status', {success: true});
        });

    });

    // Used for HATEOS authentication
    function ensureAuth(req, res, next) {
        if(app.settings.env === 'testing') {
            return next();
        }
        if(req.session.authenticated !== undefined && req.session.authenticated === true) {
            return next();
        }
        else {
            res.json({success:false, msg: 'Login required', uri: '/authtoken'}, 401);
        }
    }


    server.listen(options.port, options.host, function (err) {
        if (err) return register(err);
        console.log("HTTP server listening on http://%s%s/", options.host, ":" + options.port);
        register(null, {
            // When a plugin is unloaded, it's onDestruct function will be called if there is one.
            onDestruct: function (callback) {
                server.close(callback);
            },
            http: server,
            socket_io: io,
            express: app,
            ensureAuth: ensureAuth
        });
    });

};