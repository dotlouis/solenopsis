var elasticsearch = require('elasticsearch');

var esClient = new elasticsearch.Client({
  host: 'localhost:9200',
  apiVersion: '1.7',
  log: 'trace'
});

module.exports = function(Event) {

  Event.observe('after save', function(ctx, next) {
    //single instance updated
    if(ctx.instance){
      // console.log(ctx.instance);
      index(ctx.instance.__data);
      // if(ctx.isNewInstance)
      //   console.log('created');
      // else
      //   console.log('updated');
    }
    // multiple instances updated
    else{
      // console.log('Updated %s matching %j',
      // ctx.Model.pluralModelName,
      // ctx.where);
    }
    next();
  });

  Event.esSearch = function(queryString, cb){
    esSearch(queryString, function(err, results){
      if(err) cb(err);

      var events = results.hits.hits.map(function(event){
        return esFilter(event);
      });
      cb(null, events);
    });
  };
  Event.remoteMethod('esSearch',{
    http: {verb:'get'},
    description: 'Search for events using elasticsearch',
    accepts: {
      arg: 'queryString',
      type: 'string',
      required: true
    },
    returns: {arg: 'events', type: 'array'}
  });

};

function index(event){
  esClient.index({
    index: 'lasius',
    type: 'event',
    id: event.id,
    body: {
      title: event.title,
      body: event.body,
      createdAt:  event.createdAt,
      updatedAt: event.updatedAt
    },
    refresh: true
  });
}

function esSearch(queryString, cb){
  esClient.search({
    index: 'lasius',
    type: 'event',
    size: 30,
    body: {
      'query': {
        'match': {
          '_all': queryString
        }
      }
    }
  }, cb);
}

function esFilter(event){
  var filteredEvent = event._source;
  filteredEvent.id = event._id;
  filteredEvent._score = event._score;
  return filteredEvent;
}
