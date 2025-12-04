import connectDB from "../../../../db";
import { NextResponse } from "next/server";

export async function GET(_, { params }) {
  const { id } = params;

  try {
    const db = await connectDB();
    const [rows] = await db.execute(
      `SELECT l.*, u.nama AS nama_pelapor, u.email
       FROM laporan l
       LEFT JOIN users u ON l.userID = u.userID
       WHERE laporanID = ?`,
      [id]
    );

    await db.end();

    if (rows.length === 0) {
      return NextResponse.json({ message: "Laporan tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const { id } = params;
  const { status } = await request.json();

  if (!status) {
    return NextResponse.json({ message: "Status kosong" }, { status: 400 });
  }

  try {
    const db = await connectDB();
    await db.execute(`UPDATE laporan SET status = ? WHERE laporanID = ?`, [status, id]);
    await db.end();

    return NextResponse.json({ message: "Status diperbarui", status });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
