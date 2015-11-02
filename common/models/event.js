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
