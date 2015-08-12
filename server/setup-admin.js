var server = require('./server');
var argv = require('minimist')(process.argv.slice(2));

function grantUserAdmin(cb){
  if(argv.user || argv.u)
    var ADMIN_EMAIL = argv.user || argv.u;

  if(!ADMIN_EMAIL)
    cb("Please specify a user email to grant admin privileges to by providing the --user argument.");

  server.models.Seeder.findOne({ where: {
      'email': ADMIN_EMAIL
  }},
  function(err, seeder){
    if(err) cb(err);

    if(!seeder)
      cb(ADMIN_EMAIL + " does not match any user");

    if(!argv.revoke && !argv.r)
      server.models.Seeder.grantAdmin(seeder.id, function(err){
        if(err) cb(err);
        console.log(ADMIN_EMAIL + " has been granted admin privileges");
        console.log("Be careful, With great power comes great responsibility");
        cb();
      });
    else
      server.models.Seeder.revokeAdmin(seeder.id, function(err){
        if(err) cb(err);
        console.log(ADMIN_EMAIL + " has been removed admin privileges");
        cb();
      });

  });
}

grantUserAdmin(function(err){
  if(err){
    console.log(err);
    process.exit(1);
  }
  else
    process.exit();
});
