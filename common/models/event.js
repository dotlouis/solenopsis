var esClient = require('../../server/boot/elastic').esClient;
var _ = require('lodash');

module.exports = function(Event) {

  Event.observe('before save', function(ctx, next) {
    if(ctx.instance){
      var event = ctx.instance.__data;
      event.tags = extractHashTags(event);
    }
    next();
  });

  Event.observe('after save', function(ctx, next) {
    if(ctx.instance){
      var event = ctx.instance.__data;
      index(event);
    }
    next();
  });

  Event.esSearch = function(queryString, cb){
    if(!queryString)
      cb();

    queryString = _.trim(queryString);

    if(queryString.length===0)
      cb();

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

function extractHashTags(event){
  // http://stackoverflow.com/questions/21421526/javascript-jquery-parse-hashtags-in-a-string-using-regex-except-for-anchors-i
  var hashtags = /(#[a-z\d-]+)/gi;
  var extractedTags;
  if(event.body)
    extractedTags = event.body.match(hashtags);

  if(extractedTags)
    return extractedTags;
}

function index(event){
  esClient.index({
    index: 'lasius',
    type: 'event',
    id: event.id,
    body: {
      title: event.title,
      body: event.body,
      tags: event.tags,
      followersCount: event.followersCount,
      // start: event.start,
      // end: event.end,
      // rruleString: event.rrule.toText(),
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
