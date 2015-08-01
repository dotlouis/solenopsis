var loopback = require('loopback');
var boot = require('loopback-boot');
var config = require('./config');

var app = module.exports = loopback();

app.start = function() {

  //  Set the environment variables we need.
  app_ipaddress = process.env.OPENSHIFT_NODEJS_IP || config.host;
  app_port      = process.env.OPENSHIFT_NODEJS_PORT || config.port;

  console.log('CONFIG');
  console.log('Host: ', app_ipaddress);
  console.log('Port: ', app_port);

  // start the web server
  return app.listen(app_port, app_ipaddress, function() {
    app.emit('started');
    // console.log('Web server listening at: %s', app.get('url'));
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
