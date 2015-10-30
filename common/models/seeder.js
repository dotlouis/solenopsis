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

  Seeder.prototype.newEvent = function(eventData, cb){
    var Event = Seeder.app.models.Event;
    var self = this;

    self.events.create(eventData, function(err, event){
      if(err) cb(err);
      self.following.add(event, function(err2){
        if(err2) cb(err2);
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
