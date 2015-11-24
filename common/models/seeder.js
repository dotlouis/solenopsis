module.exports = function(Seeder) {

  Seeder.grantAdmin = function(userId, cb){
    var Role = Seeder.app.models.Role;
    var RoleMapping = Seeder.app.models.RoleMapping;

    // find or create the admin role
    Role.findOrCreate({
      name: 'admin'
    },{
      name: 'admin'
    },function(err, role){
      if(err) cb(err);

      // Add some users to this role
      role.principals.create({
        principalType: RoleMapping.USER,
        principalId: userId
      }, function(err, principal) {
        if(err) cb(err);
        cb();
      });

    });
  };

  Seeder.revokeAdmin = function(userId, cb){
    var Role = Seeder.app.models.Role;
    var RoleMapping = Seeder.app.models.RoleMapping;

    Role.findOne({where: {
      name: 'admin'
    }}, function(err, role){
      if(err) cb(err);
      if(!role) cb('Admin role does not exist');

      RoleMapping.destroyAll({
        roleId: role.id,
        principalId: userId
      }, function(err, info){
        if(err) cb(err);
        if(info.count === 0) cb('User not mapped to admin role');
        cb();
      });
    });
  };

  Seeder.prototype.follow = function(eventId, cb){
    var self = this;
    var Event = Seeder.app.models.Event;

    Event.findById(eventId, function(err, event){
      if(err) cb(err);
      self.following.add(event, function(err2){
        if(err2) cb(err2);
        event.followersCount++;
        event.save();
        cb();
      });
    });
  };
  Seeder.remoteMethod('follow',{
    http: {verb:'post'},
    isStatic: false,
    description: 'Follow a event',
    accepts: {
      arg: 'eventId',
      type: 'number',
      required: true
    }
  });


  Seeder.prototype.unfollow = function(eventId, cb){
    var self = this;
    var Event = Seeder.app.models.Event;

    Event.findById(eventId, function(err, event){
      if(err) cb(err);
      self.following.remove(event, function(err2){
        if(err2) cb(err2);
        event.followersCount--;
        event.save();
        cb();
      });
    });
  };
  Seeder.remoteMethod('unfollow',{
    http: {verb:'post'},
    isStatic: false,
    description: 'Unfollow a event',
    accepts: {
      arg: 'eventId',
      type: 'number',
      required: true
    }
  });


  Seeder.prototype.getFollowing = function(cb){
    var self = this;
    self.following({
      filter:{limit:10}
    }, function(err, events){
      cb(null,events);
    });
  };
  Seeder.remoteMethod('getFollowing',{
    http: {verb:'get'},
    isStatic: false,
    description: 'Get the events the user is following',
    returns: {arg: 'events', type: 'array'}
  });


  Seeder.prototype.newEvent = function(eventData, cb){
    var self = this;

    // computed properties, can't be set by the client
    if(eventData.hasOwnProperty('followersCount')){
      delete eventData.followersCount;
    }
    if(eventData.hasOwnProperty('tags')){
      delete eventData.tags;
    }

    // try not to create (persist) then add following (persist again)
    // and do it on a single call.
    self.events.create(eventData, function(err, event){
      if(err) cb(err);
      self.follow(event.id, function(){
        event.followersCount = 1;
        cb(null, event);
      });
    });
  };
  Seeder.remoteMethod('newEvent',{
    http: {verb:'post'},
    isStatic: false,
    description: 'Creates an event for the user and automatically follows it',
    accepts: {
      arg: 'event',
      type: 'object',
      required: true,
      http:{source:'body'}
    },
    returns: {arg: 'event', type: 'object'}
  });

};
