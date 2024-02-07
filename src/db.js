const Pool = require("pg").Pool;

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL + "?sslmode=require",
})

pool.connect(err => {
  if (err) throw err;
  console.log('connected to postgreSQL successfully');
})

module.exports = pool;