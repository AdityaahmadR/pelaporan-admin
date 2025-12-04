import connectDB from "@/lib/db";
import { NextResponse } from "next/server";

// 1. GET: Ambil Detail Laporan
export async function GET(request, { params }) {
  let connection;

  try {
    const { id } = params;
    connection = await connectDB();

    // Query Database: Ambil data laporan + nama user + email user
    const query = `
      SELECT 
        laporan.*, 
        users.nama as user_nama,
        users.email as user_email
      FROM laporan 
      LEFT JOIN users ON laporan.userID = users.userID 
      WHERE laporan.laporanID = ?
    `;

    const [rows] = await connection.query(query, [id]);

    if (rows.length === 0) {
      return NextResponse.json({ message: "Laporan tidak ditemukan" }, { status: 404 });
    }

    const dataRaw = rows[0];

    // --- LOGIKA PINTAR: EKSTRAKSI GAMBAR & SUBJECT ---
    
    let subjectDisplay = `Laporan #${dataRaw.laporanID}`;
    let finalDeskripsi = dataRaw.deskripsi || "";
    let imageUrl = null;

    if (finalDeskripsi) {
      // 1. CARI LINK GAMBAR MENGGUNAKAN REGEX
      // Mencari pola "http..." atau "https..." yang diakhiri ekstensi gambar (.jpg, .png, dll)
      // Flag 'i' membuatnya tidak peduli huruf besar/kecil (.JPG atau .jpg sama saja)
      const imageRegex = /(https?:\/\/[^\s]+?\.(?:jpg|jpeg|png|gif|webp))/i;
      const imageMatch = finalDeskripsi.match(imageRegex);

      if (imageMatch) {
        imageUrl = imageMatch[0]; // Link ditemukan! Simpan ke variabel
        
        // Hapus link tersebut dari teks deskripsi agar rapi
        finalDeskripsi = finalDeskripsi.replace(imageUrl, "");
        // Hapus juga tulisan "Gambar:" jika ada
        finalDeskripsi = finalDeskripsi.replace(/Gambar:\s*/i, ""); 
      }

      // 2. CARI SUBJECT (Format: "Subjek: ...")
      // Kita pisah per baris untuk mencari baris judul
      let lines = finalDeskripsi.split('\n');
      const subjectIndex = lines.findIndex(line => line.toLowerCase().includes("subjek:"));
      
      if (subjectIndex !== -1) {
        // Ambil teks setelah kata "Subjek:"
        subjectDisplay = lines[subjectIndex].replace(/subjek:/i, "").trim();
        // Hapus baris judul dari deskripsi utama
        lines.splice(subjectIndex, 1);
      }

      // Gabungkan sisa teks deskripsi kembali
      finalDeskripsi = lines.join('\n').trim();
    }

    // Susun data untuk dikirim ke Frontend
    const formattedData = {
      ...dataRaw,
      subject: subjectDisplay,        // Judul bersih
      isi_laporan: finalDeskripsi,    // Deskripsi bersih (tanpa link gambar & judul)
      gambar: imageUrl,               // Link gambar terpisah
      createdAt: dataRaw.tanggal,
      user: {
        nama: dataRaw.user_nama || "Anonim",
        email: dataRaw.user_email || "-"
      }
    };

    return NextResponse.json({ data: formattedData }, { status: 200 });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}

// 2. PUT: Update Status Laporan (Tetap Sama)
export async function PUT(request, { params }) {
  let connection;
  try {
    const { id } = params;
    const body = await request.json();
    const { status } = body;

    if (!status) return NextResponse.json({ message: "Status harus diisi" }, { status: 400 });

    connection = await connectDB();
    
    // Update status berdasarkan laporanID
    await connection.query("UPDATE laporan SET status = ? WHERE laporanID = ?", [status, id]);

    return NextResponse.json({ message: "Status berhasil diupdate" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}