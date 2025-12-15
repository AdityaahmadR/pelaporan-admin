// File: src/app/api/notifikasi/[userID]/route.js
import connectDB from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const { userID } = params;
  let connection;
  try {
    connection = await connectDB();
    const query = "SELECT * FROM notifikasi WHERE userID = ? ORDER BY tanggal DESC";
    const [rows] = await connection.query(query, [userID]);
    return new Response(JSON.stringify(rows), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}