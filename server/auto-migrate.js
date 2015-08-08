// More at http://docs.strongloop.com/display/public/LB/Creating+database+tables+for+built-in+models

var server = require('./server');

// exclude the 5 first objects that are not the models
var lbTables = Object.getOwnPropertyNames(server.models).splice(5);

var ds = server.dataSources.postgres;
ds.automigrate(lbTables, function(er) {
  if (er) throw er;
  console.log('Looback tables [' + lbTables + '] created in ', ds.adapter.name);
  ds.disconnect();
});
