var loopback = require('loopback');
var boot = require('loopback-boot');
var ENV = require('./env');
var argv = require('minimist')(process.argv.slice(2));

if(argv.debug || argv.d)
  var nomo = require('node-monkey').start();

var app = module.exports = loopback();

app.start = function() {
  // start the web server
  return app.listen(ENV.APP_PORT, ENV.APP_HOST, function() {
    app.emit('started');
    //  Set the environment variables we need.
    console.log('Web server listening at: %s', app.get('url'));
  });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});
