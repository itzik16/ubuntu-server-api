var should = require('should'),
    util = require('util'),
    io = require('socket.io-client'),
    fork = require('child_process').fork,
    request = require('request');

    var ioConfig = {
      'transports': ['websocket'],
      'reconnect': false,
      'max reconnection attempts': 1,
      'try multiple transports': false,
      'force new connection': true,
      'secure': true
    };

describe('dashboard plugin tests via websocket\n', function() {

    before(function(done) {
        var that = this;
        this.testServer = fork('./server.js', [], {silent: false, env: {NODE_ENV: 'testing'}});
        this.testServer.on('message', function (msg) {
            if (msg === 'listening') {
                done();
            }
        });
    });

    after(function(done) {
        this.dashboard.disconnect();
        this.netStats.disconnect();
        this.platform.disconnect();
        this.testServer.on('disconnect', function() {
            done();
        });
        this.testServer.kill();
    });

    it('should return valid CPU and memory data', function(done) {
        var dashboard = this.dashboard = io.connect('https://127.0.0.1:8890/dash', ioConfig);
        dashboard.on('connect', function() {
            dashboard.emit('cpumem');
            dashboard.on('cpumem', function(data) {
                (data.cpus[0]['utilization']).should.be.within(0, 100);
                (data.mem.totalMem).should.be.above(0);
                (data.mem.freeMem).should.be.above(0);
                done();
           });
       });

    });

    it('should return valid net services data', function(done) {
        var netStats = this.netStats = io.connect('https://127.0.0.1:8890/dash', ioConfig);
        netStats.on('connect', function() {
            netStats.emit('net-services');
            netStats.on('net-services', function(data) {
                should.exist(data.netServices);
                data.netServices.should.be.an.instanceOf(Array);
                (data.netServices.length).should.be.above(0);
                done();
           });
       });

    });

    it('should return valid os platform data', function(done) {
        var platform = this.platform = io.connect('https://127.0.0.1:8890/dash', ioConfig);
        platform.on('connect', function() {
            platform.emit('os-platform');
            platform.on('os-platform', function(data) {
                should.exist(data.codename);
                should.exist(data.release);
                should.exist(data.kernel);
                data.release.should.match(/^ubuntu/i);
                done();
           });
       });

    });
});


describe('dashboard plugin tests via HATEOS\n', function() {

    before(function(done) {
        var that = this;
        this.testServer = fork('./server.js', [], {silent: false, env: {NODE_ENV: 'testing'}});
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

    it('should return valid CPU and memory data', function(done) {
        request.get('https://127.0.0.1:8890/dash/cpumem', function (error, response, data) {
            data = JSON.parse(data);
            should.not.exist(error);
            (response.statusCode).should.equal(200);
            (data.cpus[0]['utilization']).should.be.within(0, 100);
            (data.mem.totalMem).should.be.above(0);
            (data.mem.freeMem).should.be.above(0);
            done();
        });
    });

    it('should return valid net services data', function(done) {
        request.get('https://127.0.0.1:8890/dash/net-services', function (error, response, data) {
            data = JSON.parse(data);
            should.not.exist(error);
            (response.statusCode).should.equal(200);
            should.exist(data.netServices);
            data.netServices.should.be.an.instanceOf(Array);
            (data.netServices.length).should.be.above(0);
            done();
        });
    });

    it('should return valid os platform data', function(done) {
        request.get('https://127.0.0.1:8890/dash/os-platform', function (error, response, data) {
            data = JSON.parse(data);
            should.not.exist(error);
            (response.statusCode).should.equal(200);
            should.exist(data.codename);
            should.exist(data.release);
            should.exist(data.kernel);
            data.release.should.match(/^ubuntu/i);
            done();
        });
    });
});