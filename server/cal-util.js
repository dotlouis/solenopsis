var RRule = require('rrule').RRule;
var _ = require('lodash');
var moment = require('moment');

var Calendar = function(events){

  if(!events || events.length < 1)
    return;

  this.events = events;


};

Calendar.prototype.generate = function(options){
  options = options || {};
  this.mode = options.mode === 'flat' ? options.mode : 'nested';
  this.daysCount = typeof options.daysCount === 'number' ? options.daysCount : 30;
  this.offset = typeof options.offset === 'number' ? options.offset : 0;

  var structure = makeStructure(this.daysCount);

  var eventsOccurences = computeOccurences(this.events, _.last(structure));

  var calendar;
  if(this.mode === 'flat')
    calendar = insertEventsFlattened(structure, eventsOccurences);
  else
    calendar = insertEventsNested(structure, eventsOccurences);

  return calendar;
};


function makeStructure(daysCount){
  var structure = [];
  new RRule({
    freq: RRule.DAILY,
    count: daysCount
  }).all(function(date){
    structure.push(moment(date).startOf('day').toDate());
    return true;
  });
  return structure;
}

// nested structure (events inside days)
function insertEventsNested(structure, events){
  return _.map(structure, function(date){
    var day = {
      date: date,
      events: []
    };

    var e = events[moment(date).toISOString()];

    if(e && e.length > 0)
      day.events = e;

    return day;
  });
}

// flattened structure (events sibling to days (in order))
function insertEventsFlattened(structure, events){
  var calendar = [];

  for(var i=0; i<structure.length; i++){
    // add structure
    calendar.push({type: 'day', value: structure[i]});

    var e = events[moment(structure[i]).toISOString()];

    // if event, add it to structure
    if(e && e.length > 0){
      for(var j=0; j<e.length; j++){
        calendar.push({type:'event', value:e[j]});
      }
    }
  }

  return calendar;
}

function computeOccurences(events, until){
  return _.chain(events)
  .map(function(event){
    // should be removed now the rrule is required
    if(!event.rrule)
    return;

    var rrule = RRule.fromString(event.rrule);
    var eventOccurences = [];
    rrule.between(new Date(), until, true, function(date){
      eventOccurences.push({date: date, details: event});
      return true;
    });
    return eventOccurences;
  })
  .flatten()
  // should be removed now the rrule is required
  .without(undefined)
  .groupBy(function(event){
    return moment(event.date).startOf('day').toISOString();
  })
  .value();
}

module.exports = {
    Calendar: Calendar
};
