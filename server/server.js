var loopback = require('loopback');
var boot = require('loopback-boot');

var app = module.exports = loopback();

app.start = function() {

  //  Set the environment variables we need.
  app_ipaddress = process.env.OPENSHIFT_NODEJS_IP;
  app_port      = process.env.OPENSHIFT_NODEJS_PORT || 3005;

  if (typeof app_ipaddress === "undefined") {
      //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
      //  allows us to run/test the app locally.
      console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
      app_ipaddress = "127.0.0.1";
  };

  // start the web server
  return app.listen(app_port, app_ipaddress, function() {
    app.emit('started');
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
