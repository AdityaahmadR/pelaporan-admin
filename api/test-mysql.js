import mysql from 'mysql2/promise';

export default async function handler(req, res) {
  try {
    const conn = await mysql.createConnection({
      host: process.env.MYSQLHOST,
      user: process.env.MYSQLUSER,
      password: process.env.MYSQLPASSWORD,
      database: process.env.MYSQLDATABASE,
      port: Number(process.env.MYSQLPORT),
      ssl: { rejectUnauthorized: false }
    });

    const [rows] = await conn.execute("SELECT NOW() AS time");

    res.status(200).json({
      status: "Connected to MySQL!",
      server_time: rows[0].time
    });

  } catch (err) {
    res.status(500).json({
      status: "MySQL Error",
      error: err.message
    });
  }
}
