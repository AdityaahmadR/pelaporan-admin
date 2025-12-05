// db.js (versi yang sudah diperbaiki)
import mysql from 'mysql2/promise';

export default async function connectDB() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: Number(process.env.MYSQLPORT),
  });
  return connection;
}