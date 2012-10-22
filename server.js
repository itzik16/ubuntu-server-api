var path = require('path'),
    architect = require("architect");

var configPath = path.join(__dirname, "config.js"),
    config = architect.loadConfig(configPath);

architect.createApp(config, function (err, app) {
  if (err) throw err;
  console.log("app started");
  
  // Used for testsuite forking
  if (process.send) {
    process.send('listening');
  }
});