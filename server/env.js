var config = require('./config');

module.exports = {
  APP_HOST: process.env.OPENSHIFT_NODEJS_IP || config.host,
  APP_PORT: process.env.OPENSHIFT_NODEJS_PORT || config.port,
  NODE_ENV: process.env.NODE_ENV || 'production',
  FB_APP_ID: process.env.FB_APP_ID || 'Facebook Application ID',
  FB_APP_SECRET:process.env.FB_APP_SECRET || 'Facebook Application Secret'
};
