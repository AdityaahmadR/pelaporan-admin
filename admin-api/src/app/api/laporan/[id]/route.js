import connectDB from "@/app/lib/db";

export async function PUT(req, { params }) {
  const { id } = params;
  const { status } = await req.json();
  const db = await connectDB();

  await db.execute(`UPDATE laporan SET status = ? WHERE laporanID = ?`, [status, id]);
  await db.end();

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}

export async function GET(req, { params }) {
  const { id } = params;
  const db = await connectDB();
  const [rows] = await db.execute(
    `SELECT laporan.*, masyarakat.nama, masyarakat.email 
     FROM laporan 
     LEFT JOIN masyarakat ON laporan.userID = masyarakat.userID 
     WHERE laporan.laporanID = ?`, 
     [id]
  );

  await db.end();
  return new Response(JSON.stringify(rows[0] || null), { status: 200 });
}
