import { NextResponse } from 'next/server';
import connectDB from '../../../../db';

// === GET LAPORAN ===
export async function GET() {
  let db;

  try {
    db = await connectDB();
    const [rows] = await db.execute("SELECT * FROM laporan ORDER BY tanggal DESC");

    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error("❌ Error GET laporan:", error);
    return NextResponse.json({ message: "Gagal mengambil data laporan." }, { status: 500 });
  } finally {
    if (db) await db.end();
  }
}


// === POST LAPORAN ===
export async function POST(request) {
  const { userID, deskripsi } = await request.json();

  if (!userID || !deskripsi) {
    return NextResponse.json(
      { message: "User ID dan deskripsi wajib!" },
      { status: 400 }
    );
  }

  let db;

  try {
    db = await connectDB();
    const query = "INSERT INTO laporan (userID, deskripsi) VALUES (?, ?)";
    await db.execute(query, [userID, deskripsi]);

    return NextResponse.json(
      { success: true, message: "Laporan berhasil dikirim!" },
      { status: 201 }
    );

  } catch (error) {
    console.error("❌ Error POST laporan:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menambahkan laporan.", error: error.message },
      { status: 500 }
    );
  } finally {
    if (db) await db.end();
  }
}
