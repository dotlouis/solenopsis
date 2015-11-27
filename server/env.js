var config = require('./config');
var pkg = require('../package.json');


var version = pkg.version.split('.').shift();

module.exports = {
  // NODE
  // 'production' by default for security reasons
  // setting NODE_ENV to 'production' disable loopback-explorer
  // and stacktraces in JSON responses
  // http://docs.strongloop.com/display/public/LB/Environment-specific+configuration#Environment-specificconfiguration-Turningoffstacktraces
  NODE_ENV: process.env.NODE_ENV || 'production',

  // APP
  APP_HOST: process.env.OPENSHIFT_NODEJS_IP || config.host,
  APP_PORT: process.env.OPENSHIFT_NODEJS_PORT || config.port,

  //API
  API_ROOT: '/api' + (version > 0 ? '/v' + version : '') || config.restApiRoot,

  // FACEBOOK
  FB_APP_ID: process.env.FB_APP_ID,
  FB_APP_SECRET: process.env.FB_APP_SECRET,

  // POSTGRESQL DATASOURCE
  PG_HOST: process.env.OPENSHIFT_POSTGRESQL_DB_HOST || 'localhost',
  PG_PORT: process.env.OPENSHIFT_POSTGRESQL_DB_PORT || 5432,
  PG_USERNAME: process.env.OPENSHIFT_POSTGRESQL_DB_USERNAME,
  PG_PASSWORD: process.env.OPENSHIFT_POSTGRESQL_DB_PASSWORD,
  PG_DATABASE: process.env.PGDATABASE,

  // ELASTICSEARCH
  ES_HOST: process.env.ES_HOST || 'localhost',
  ES_PORT: process.env.ES_PORT || '9200',
  ES_API_VERSION: process.env.ES_API_VERSION || '1.7'
};
