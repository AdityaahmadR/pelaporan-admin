import connectDB from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  let connection;

  try {
    const { id } = params;

    // 1. Buka Koneksi
    connection = await connectDB();

    // 2. Query Database
    // PERBAIKAN: 
    // - Menggunakan 'laporan.laporanID' (bukan 'id')
    // - Menggunakan 'laporan.userID' (bukan 'user_id')
    // - JOIN ke tabel users (Asumsi PK users adalah 'id'. Jika error, ganti jadi 'users.userID')
    const query = `
      SELECT 
        laporan.*, 
        users.nama as user_nama 
      FROM laporan 
      LEFT JOIN users ON laporan.userID = users.id 
      WHERE laporan.laporanID = ?
    `;

    const [rows] = await connection.query(query, [id]);

    // Cek jika data tidak ditemukan
    if (rows.length === 0) {
      return NextResponse.json(
        { message: "Laporan tidak ditemukan" }, 
        { status: 404 }
      );
    }

    const dataRaw = rows[0];

    // 3. Data Mapping (PENTING)
    // Frontend kamu meminta: 'subject', 'isi_laporan', 'createdAt'
    // Database kamu punya: 'deskripsi', 'tanggal'
    
    // Logika ekstra: Coba ambil "Subjek: ..." dari deskripsi jika ada
    let subjectDisplay = `Laporan #${dataRaw.laporanID}`;
    if (dataRaw.deskripsi && dataRaw.deskripsi.includes("Subjek:")) {
      const parts = dataRaw.deskripsi.split('\n');
      subjectDisplay = parts[0].replace("Subjek:", "").trim();
    }

    const formattedData = {
      ...dataRaw,
      // Mapping Field DB -> Field Frontend
      subject: subjectDisplay,            // Frontend butuh 'subject'
      isi_laporan: dataRaw.deskripsi,     // Frontend butuh 'isi_laporan', DB punya 'deskripsi'
      createdAt: dataRaw.tanggal,         // Frontend butuh 'createdAt', DB punya 'tanggal'
      user: {
        nama: dataRaw.user_nama || "Anonim"
      }
    };

    return NextResponse.json({ data: formattedData }, { status: 200 });

  } catch (error) {
    console.error("Database Error (GET):", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message }, 
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}

export async function PUT(request, { params }) {
  let connection;

  try {
    const { id } = params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ message: "Status harus diisi" }, { status: 400 });
    }

    connection = await connectDB();

    // PERBAIKAN: Gunakan 'laporanID' di WHERE clause
    const query = "UPDATE laporan SET status = ? WHERE laporanID = ?";
    await connection.query(query, [status, id]);

    return NextResponse.json({ message: "Status berhasil diupdate" }, { status: 200 });

  } catch (error) {
    console.error("Database Error (PUT):", error);
    return NextResponse.json(
      { message: "Gagal update status", error: error.message }, 
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}