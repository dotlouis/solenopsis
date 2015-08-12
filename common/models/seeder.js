module.exports = function(Seeder) {

  // // Grant admin privileges on signup (based on env var ADMIN_EMAIL)
  // Seeder.observe('after save', function(ctx, next) {
  //   if(ctx.instance)
  //     if(ctx.isNewInstance)
  //       if(ctx.instance.__data.email === process.env.ADMIN_EMAIL)
  //         makeAdmin(ctx.instance.id);
  //   next();
  // });


  Seeder.makeAdmin = function(userId, cb){
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

};
