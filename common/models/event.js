var esClient = require('../../server/boot/elastic').esClient;
var _ = require('lodash');

module.exports = function(Event) {

  Event.observe('after save', function(ctx, next) {
    //single instance updated
    if(ctx.instance){
      // console.log(ctx.instance);
      var event = ctx.instance.__data;
      event = extractHashTags(event);
      index(event);
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
  var extractedTags = event.body.match(hashtags);
  if(extractedTags)
    event.tags = extractedTags;
  return event;
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
