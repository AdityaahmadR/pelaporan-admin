// db.js
import mysql from "mysql2/promise";

let pool;

if (!global._mysqlPool) {
  global._mysqlPool = mysql.createPool({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: Number(process.env.MYSQLPORT),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: {
      rejectUnauthorized: false
    }
  });
}

pool = global._mysqlPool;

export default pool;
