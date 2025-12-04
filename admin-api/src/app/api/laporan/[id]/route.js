import connectDB from "@/lib/db";
import { NextResponse } from "next/server";

// 1. GET: Mengambil Detail Laporan
export async function GET(request, { params }) {
  let connection;

  try {
    const { id } = params;

    // Buka Koneksi ke Database
    connection = await connectDB();

    // Query Database (SUDAH DIPERBAIKI SESUAI SKEMA KAMU)
    // - Menggunakan laporan.userID = users.userID (Bukan users.id)
    // - Menggunakan laporan.laporanID (Bukan laporan.id)
    const query = `
      SELECT 
        laporan.*, 
        users.nama as user_nama 
      FROM laporan 
      LEFT JOIN users ON laporan.userID = users.userID 
      WHERE laporan.laporanID = ?
    `;

    const [rows] = await connection.query(query, [id]);

    // Jika data tidak ditemukan
    if (rows.length === 0) {
      return NextResponse.json(
        { message: "Laporan tidak ditemukan" }, 
        { status: 404 }
      );
    }

    const dataRaw = rows[0];

    // MAPPING DATA (Database -> Frontend)
    // Frontend kamu butuh variabel: subject, isi_laporan, createdAt
    // Database kamu punya: deskripsi, tanggal
    
    // 1. Logika ambil Subject dari baris pertama deskripsi (karena formatmu: "Subjek: ...")
    let subjectDisplay = `Laporan #${dataRaw.laporanID}`;
    if (dataRaw.deskripsi && dataRaw.deskripsi.toLowerCase().includes("subjek:")) {
      const parts = dataRaw.deskripsi.split('\n');
      // Ambil baris pertama, hapus kata "Subjek:", lalu rapikan spasi
      subjectDisplay = parts[0].replace(/subjek:/i, "").trim();
    }

    // 2. Susun object data baru
    const formattedData = {
      ...dataRaw,
      subject: subjectDisplay,            
      isi_laporan: dataRaw.deskripsi,     // DB: deskripsi -> Frontend: isi_laporan
      createdAt: dataRaw.tanggal,         // DB: tanggal -> Frontend: createdAt
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
    // Tutup koneksi (Wajib)
    if (connection) await connection.end();
  }
}

// 2. PUT: Update Status Laporan
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

    // Update status menggunakan laporanID
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