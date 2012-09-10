module.exports = function setup(options, imports, register) {
    
    var os = require('os'),
        util = require('util'),
        shell = require('shelljs');
    
    register(null, {
        // "dashbaord" is a service this plugin provides
        dashboard: {
            cpuStats: function () {
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
            },

            memStats: function () {
                var mem = {};
                mem.totalMem = os.totalmem();
                mem.freeMem = os.freemem();
                mem.utilization = (100 * (mem.freeMem / mem.totalMem));

                return mem;
            },

            netStats: function() {
                var netServices = [],
                rawOutput = shell.exec('netstat -tulpn', {silent: true}).output || '',
                rawLines = rawOutput.split(/\r\n|\r|\n/);

                rawLines = rawLines.slice(2, -1);

                rawLines.forEach(function(rawLine, val, allItems) {
                    netServices.push({name: rawLine.slice(rawLine.lastIndexOf('/') + 1).trim()});
                });


                return {netServices: netServices};
            },

            platformStats: function() {
                var codename = shell.exec('lsb_release -c', {silent:true}).output || '';
                codename = codename.slice(1 + codename.indexOf(':')).trim();

                var release = shell.exec('lsb_release -d', {silent:true}).output || '';
                release = release.slice(1 + release.indexOf(':')).trim();

                var kernel = shell.exec('uname -r', {silent:true}).output || '';

                return {codename: codename, release: release, kernel: kernel};
            }
        }
    });

};