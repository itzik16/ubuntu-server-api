module.exports = function setup(options, imports, register) {
    
    var os = require('os'),
        util = require('util'),
        shell = require('shelljs');

    var express = imports.express,
        io = imports.socket_io,
        sessionSockets = imports.sessionSockets,
        ensureAuth = imports.ensureAuth;

    function cpuStats() {
        var coreCount = os.cpus().length;
        var raw = os.cpus(),
            cpus = [];
        
        for (var cnt = coreCount; cnt--; ) {
            var times = raw[cnt].times,
                total = 0;
                
            for (var key in times) {
                total += times[key];
            }
            
            cpus[cnt] = {
                total: total,
                idle: times.idle,
                used: (total - times.idle),
                utilization: (100 * ((total - times.idle) / total)).toFixed(2)
            };
        }
        return cpus;
    }

    function memStats() {
        var mem = {};
        mem.totalMem = os.totalmem();
        mem.freeMem = os.freemem();
        mem.utilization = (100 * (mem.freeMem / mem.totalMem));

        return mem;
    }

    function netStats() {
        var netServices = [],
        rawOutput = shell.exec('netstat -tulpn', {silent: true}).output || '',
        rawLines = rawOutput.split(/\r\n|\r|\n/);

        rawLines = rawLines.slice(2, -1);

        rawLines.forEach(function(rawLine, val, allItems) {
            netServices.push({name: rawLine.slice(rawLine.lastIndexOf('/') + 1).trim()});
        });

        return {netServices: netServices};
    }

    function platformStats() {
        var codename = shell.exec('lsb_release -c', {silent:true}).output || '';
        codename = codename.slice(1 + codename.indexOf(':')).trim();

        var release = shell.exec('lsb_release -d', {silent:true}).output || '';
        release = release.slice(1 + release.indexOf(':')).trim();

        var kernel = shell.exec('uname -r', {silent:true}).output || '';
        kernel = kernel.slice(0, kernel.length - 1);

        return {codename: codename, release: release, kernel: kernel};
    }

    // REST Routes
    express.get('/dash/cpumem', ensureAuth, function(req, res) {
        var stats = {cpus: cpuStats(), mem: memStats()};
        res.json(stats);
    });

    express.get('/dash/net-services', ensureAuth, function(req, res) {
        res.json(netStats());
    });

    express.get('/dash/os-platform', ensureAuth, function(req, res) {
        res.json(platformStats());
    });

    // Socket.io Routes
    var dashboard_io = io
        .of('/dash')
        .on('connection', function (socket) {
            
            socket.on('cpumem', function (data) {
                var stats = {cpus: cpuStats(), mem: memStats()};
                socket.emit('cpumem', stats);
            });

            socket.on('net-services', function (data) {
                socket.emit('net-services', netStats());
            });

            socket.on('os-platform', function (data) {
                socket.emit('os-platform', platformStats());
            });
            
      });

    register(null, {
        // "dashboard" is a service this plugin provides
        dashboard: {
            cpuStats: cpuStats,
            memStats: memStats,
            netStats: netStats,
            platformStats: platformStats
        }
    });

};