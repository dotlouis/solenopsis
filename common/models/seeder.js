var Calendar = require('../../server/cal-util').Calendar;

module.exports = function(Seeder) {

  Seeder.observe('before save', function(ctx, next) {
    if(ctx.instance){
      var seeder = ctx.instance.__data;
      seeder.profilePic = updateProfilePic(seeder);
    }
    next();
  });

  function updateProfilePic(seeder){
    if(seeder.fbId)
      return 'https://graph.facebook.com/'+seeder.fbId+'/picture?type=large';
    else
      return;
  }

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

  Seeder.prototype.getProfile = function(cb){
    var self = this;
    var profile = {};
    self.__count__following(function(err, followingCount){
      if(err) cb(err);
      profile.followingCount = followingCount;
      self.__count__events(function(err, createdCount){
        if(err) cb(err);
        profile.createdCount = createdCount;
        cb(null, profile);
      });
    });
  };
  Seeder.remoteMethod('getProfile',{
    http: {verb:'get'},
    isStatic: false,
    description: 'Get the profile of the user (following, created, etc.)',
    returns: {arg: 'profile', type: 'object'}
  });

  Seeder.prototype.getFollowing = function(cb){
    var self = this;
    self.following({
      filter:{limit:10}
    }, function(err, events){
      if(err) cb(err);
      cb(null, events);
    });
  };
  Seeder.remoteMethod('getFollowing',{
    http: {verb:'get'},
    isStatic: false,
    description: 'Get the events the user is following',
    returns: {arg: 'events', type: 'array'}
  });

  Seeder.prototype.getCalendar = function(mode, cb){
    var self = this;

    this.mode = mode === 'flat' ? mode : 'nested';
    this.daysCount = 30;
    this.offset = 0;

    self.following(function(err, events){
      if(err) cb(err);
      var cal = new Calendar(events)
        .generate({
          mode: self.mode,
          daysCount: self.daysCount,
          offset: self.offset
        });
      cb(null, cal);
    });
  };
  Seeder.remoteMethod('getCalendar',{
    http: {verb:'get'},
    accepts: {
      arg: 'mode',
      type: 'string',
      http:{source:'query'}
    },
    isStatic: false,
    description: 'Get the calendar of the user (structure + content)',
    returns: {arg: 'calendar', type: 'object'}
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
