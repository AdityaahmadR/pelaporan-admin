import { NextResponse } from "next/server";
import connectDB from "../../../lib/db";

// GET laporan
export async function GET() {
  try {
    const db = await connectDB();
    const [rows] = await db.query("SELECT * FROM laporan ORDER BY tanggal DESC");
    await db.end();

    return NextResponse.json(rows, { status: 200 });

  } catch (error) {
    console.error("❌ Error GET laporan:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST laporan (tidak diubah)
export async function POST(request) {
  const { userID, deskripsi } = await request.json();

  if (!userID || !deskripsi) {
    return NextResponse.json({ message: "User ID dan deskripsi wajib diisi" }, { status: 400 });
  }

  try {
    const db = await connectDB();
    await db.execute("INSERT INTO laporan (userID, deskripsi) VALUES (?, ?)", [userID, deskripsi]);
    await db.end();

    return NextResponse.json({ success: true, message: "Laporan berhasil dikirim" }, { status: 201 });

  } catch (error) {
    console.error("❌ Error POST laporan:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
