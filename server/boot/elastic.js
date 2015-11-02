var env = require('../env');
var elasticsearch = require('elasticsearch');

var esOptions = {
  host: env.ES_HOST+':'+env.ES_PORT,
  apiVersion: env.ES_API_VERSION
};

if(env.NODE_ENV === 'development')
  esOptions.log = 'trace';

exports.esClient = new elasticsearch.Client(esOptions);
