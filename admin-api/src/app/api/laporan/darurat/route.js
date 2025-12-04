import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/db';

export async function POST(request) {
  const { userID, deskripsi } = await request.json();

  if (!userID || !deskripsi) {
    return NextResponse.json({ message: 'User ID dan subjek laporan harus diisi.' }, { status: 400 });
  }

  const db = await connectDB();

  try {
    // Mengatur prioritas menjadi 'tinggi' untuk laporan darurat
    const query = 'INSERT INTO laporan (userID, deskripsi, prioritas) VALUES (?, ?, ?)';
    const values = [userID, deskripsi, 'tinggi'];
    await db.execute(query, values);

    await db.end();

    return NextResponse.json({ success: true, message: 'Laporan darurat berhasil dikirim!' }, { status: 201 });

  } catch (error) {
    console.error('❌ Terjadi error saat mengirim laporan darurat:', error);
    if (db) await db.end();
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan pada server.', error: error.message }, { status: 500 });
  }
}
