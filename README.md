# Studloop

[LoopBack](http://loopback.io) backend for studant.

## Installation

```bash
npm install
```

You will need some environment variable for the app to run the way you want.
See [direnv](https://github.com/direnv/direnv) for a nice way to manage environment variables.

```bash
######### Required

# The Facebook app ID and secret for Facebook login
# https://developers.facebook.com/apps/
export FB_APP_ID
export FB_APP_SECRET

# The Postgresql datasource config
export PGDATABASE
export OPENSHIFT_POSTGRESQL_DB_USERNAME
export OPENSHIFT_POSTGRESQL_DB_PASSWORD

######### Optional

# Enable loopback-explorer and stacktraces in JSON responses
export NODE_ENV=development # default: production

# Change ip address and port your app listen to
export OPENSHIFT_NODEJS_IP # default: 0.0.0.0
export OPENSHIFT_NODEJS_PORT # default: 3005

# address and port of your Postgres database
export OPENSHIFT_POSTGRESQL_DB_HOST # default: localhost
export OPENSHIFT_POSTGRESQL_DB_PORT # default: 5432
```

*Note: Working in the [Openshift environment](https://developers.openshift.com/en/managing-environment-variables.html), PGDATABASE and all variables begining with OPENSHIFT_ are already set*

Launch the app
```bash
node server/server.js
# use --debug or -d to debug the app at localhost:50500
```

## Deploy

The `openshift` branch is used for deploying only.
http://stackoverflow.com/questions/12657168/can-i-use-my-existing-git-repo-with-openshift

```bash
# To deploy first checkout the openshift branch
git checkout openshift
# Then merge master INTO openshift (not the opposite)
git merge --no-ff master

# --no-fast-forward to let you manage eventual conflicts

# Finally push the result to the remote master branch
git push openshift HEAD:master -f

# the -f is to overwrite anything in the remote. You can't have a conflict on the remote, it's supposed to already have been taken care of locally and it would be a pain to solve.

```

**Desambiguation**
- `openshift` is the name of a local branch
- `openshift` is also the name of the remote

Here, `git push`, pushes changes from the local openshift branch to the remote *- called openshift -* master branch. Get it ?
