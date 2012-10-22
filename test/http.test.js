var should = require('should'),
    util = require('util'),
    io = require('socket.io-client'),
    fork = require('child_process').fork,
    http = require('http'),
    request = require('request');

    var ioConfig = {
        'transports': ['websocket'],
        'reconnect': false,
        'max reconnection attempts': 1,
        'try multiple transports': false,
        'force new connection': true
    };

describe('http plugin tests\n', function() {

    describe('websocket server with authorization enabled', function() {
        before(function(done) {
            this.testServerTwo = fork('./server.js', [], {silent: false, env: {NODE_ENV: 'development'}});
            this.testServerTwo.on('message', function (msg) {
                if (msg === 'listening') {
                    done();
                }
            });
        });

        after(function(done) {
            this.ws.disconnect();
            this.testServerTwo.on('disconnect', function() {
                done();
            });
            this.testServerTwo.kill();
        });
        

        it('status websocket endpoint should return a "handshake error" error message when hit without passing a cookie', function(done) {
            var ws = this.ws = io.connect('http://127.0.0.1:3030', ioConfig);

            ws.on('error', function(errMsg) {
                should.exist(errMsg);
                ('handshake error').should.eql(errMsg.slice(0, 15));
                done();
            });
        });

    });

    describe('core websocket endpoints\n', function() {
        
        before(function(done) {
            this.testServerOne = fork('./server.js', [], {silent: false, env: {NODE_ENV: 'testing'}});
            this.testServerOne.on('message', function (msg) {
                if (msg === 'listening') {
                    done();
                }
            });
        });
        

        after(function(done) {
            this.ws.disconnect();
            this.testServerOne.on('disconnect', function() {
                done();
            });
            this.testServerOne.disconnect();
            this.testServerOne.kill();
        });

        it('status websocket endpoint returns "ok"', function(done) {
            var ws = this.ws = io.connect('http://127.0.0.1:3030', ioConfig);

            ws.on('connect', function() {
                ws.emit('status');
                ws.on('status', function(data) {
                    (data.success).should.be.true;
                    done();
                });
            });

        });

    });

    // Notes: was going to create a new user then test
    // auth on that. But that approach also required root.
    // Remove the x and replace password placeholder to enable test.
    describe('user authentication via PAM\n', function() {
        before(function(done) {
            this.testServer = fork('./server.js', [], {silent: false, env: {NODE_ENV: 'development'}});
            this.testServer.on('message', function (msg) {
                if (msg === 'listening') {
                    done();
                }
            });
        });
        
        after(function(done) {
            this.testServer.on('disconnect', function() {
                done();
            });
            this.testServer.disconnect();
            this.testServer.kill();
        });

        it('authenticate root user and return session id', function(done) {
            request.post({
                url: 'http://127.0.0.1:3030/authtoken',
                form: {username: 'david', password: 'devbox99'}
            },
            function (error, response, body) {
                should.not.exist(error);
                (response.statusCode).should.equal(200);
                should.exist(response.headers['set-cookie']);

                done();
            });
        });

    });

});
