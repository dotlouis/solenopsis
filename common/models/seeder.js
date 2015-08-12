module.exports = function(Seeder) {

  // // Grant admin privileges on signup (based on env var ADMIN_EMAIL)
  // Seeder.observe('after save', function(ctx, next) {
  //   if(ctx.instance)
  //     if(ctx.isNewInstance)
  //       if(ctx.instance.__data.email === process.env.ADMIN_EMAIL)
  //         makeAdmin(ctx.instance.id);
  //   next();
  // });


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
      if(!role) cb("Admin role does not exist");

      RoleMapping.destroyAll({
        roleId: role.id,
        principalId: userId
      }, function(err, info){
        if(err) cb(err);
        if(info.count === 0) cb("User not mapped to admin role");
        cb()
      });
    });
  };

};
