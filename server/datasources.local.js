var env = require('./env');

module.exports = {
  postgres: {
    hostname: env.PG_HOST,
    port: env.PG_PORT,
    user: env.PG_USERNAME,
    password: env.PG_PASSWORD,
    database: env.PG_DATABASE
  }
};
