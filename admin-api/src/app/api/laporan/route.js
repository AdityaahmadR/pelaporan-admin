import { NextResponse } from 'next/server';
import connectDB from '../../../../db';

export async function POST(request) {
  const { userID, deskripsi } = await request.json();

  if (!userID || !deskripsi) {
    return NextResponse.json({ message: 'User ID dan deskripsi laporan harus diisi.' }, { status: 400 });
  }

  const db = await connectDB();

  try {
    const query = 'INSERT INTO laporan (userID, deskripsi) VALUES (?, ?)';
    const values = [userID, deskripsi];
    await db.execute(query, values);

    await db.end();

    return NextResponse.json({ success: true, message: 'Laporan berhasil dikirim!' }, { status: 201 });

  } catch (error) {
    console.error('❌ Terjadi error saat mengirim laporan:', error);
    if (db) await db.end();
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan pada server.', error: error.message }, { status: 500 });
  }
}
