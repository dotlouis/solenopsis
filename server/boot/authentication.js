var satellizer = require('loopback-component-satellizer');
var ENV = require('../env');

module.exports = function enableAuthentication(server) {
  // enable authentication
  server.enableAuth();

  satellizer.Facebook({
    // The model that extends User model and where you want to bind the facebook connector
    model: server.models.Seeder,
    facebook: {
      // Put here the credentials used to connect to Facebook.
      // You can follow the example and put it in your config.json
      credentials: {
        public: ENV.FB_APP_ID,
        private: ENV.FB_APP_SECRET
      },
      // The uri of the facebook connexion method
      uri: '/facebook',
      // How you want to map the facebook profile on your model
      // The key is the facebook profile key and the value is your model key
      mapping: {
        id: 'facebookId',
        email: 'email',
        first_name: 'firstName',
        last_name: 'lastName',
        gender: 'gender'
      }
    }
  });
};
