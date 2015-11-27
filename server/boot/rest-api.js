var ENV = require('../env');

module.exports = function mountRestApi(server) {
  server.use(ENV.API_ROOT, server.loopback.rest());
  server.once('started', function(){
    console.log('API available at: %s%s',
      server.get('url').replace(/\/$/, ''),
      ENV.API_ROOT
    );
  });
};
