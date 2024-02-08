const Pool = require("pg").Pool;
require('dotenv').config()

const Database = process.env.PG_DATABASE;
const UserName = process.env.PG_USER;
const Password = process.env.PG_PASSWORD;
const Host = process.env.PG_HOST;
const Port = process.env.PG_PORT;

const pool = new Pool({
  connectionString: `postgres://${UserName}:${Password}@${Host}:${Port}/${Database}`,
})

module.exports = pool;