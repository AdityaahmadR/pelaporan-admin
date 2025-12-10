// src/app/api/semua-laporan/[id]/route.js
import connectDB from "@/lib/db";

// PERBAIKAN #1: Mencegah Vercel melakukan build statis.
export const dynamic = 'force-dynamic';

// --- FUNGSI GET (Ambil Detail Laporan) ---
export async function GET(request, { params }) {
  let connection;
  try {
    const { id } = params;
    connection = await connectDB();

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
      // PERBAIKAN #2: Gunakan new Response() seperti file lain yang berhasil.
      return new Response(JSON.stringify({ message: "Laporan tidak ditemukan" }), { 
        status: 404, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    const dataRaw = rows[0];
    let subjectDisplay = `Laporan #${dataRaw.laporanID}`;
    let finalDeskripsi = dataRaw.deskripsi || "";
    let imageUrl = null;

    if (finalDeskripsi) {
      const imageRegex = /(https?:\/\/[^\s]+?\.(?:jpg|jpeg|png|gif|webp))/i;
      const imageMatch = finalDeskripsi.match(imageRegex);
      if (imageMatch) {
        imageUrl = imageMatch[0];
        finalDeskripsi = finalDeskripsi.replace(imageUrl, "").replace(/Gambar:\s*/i, "");
      }
      let lines = finalDeskripsi.split('\n');
      const subjectIndex = lines.findIndex(line => line.toLowerCase().includes("subjek:"));
      if (subjectIndex !== -1) {
        subjectDisplay = lines[subjectIndex].replace(/subjek:/i, "").trim();
        lines.splice(subjectIndex, 1);
      }
      finalDeskripsi = lines.join('\n').trim();
    }

    const formattedData = {
      ...dataRaw,
      subject: subjectDisplay,
      isi_laporan: finalDeskripsi,
      gambar: imageUrl,
      createdAt: dataRaw.tanggal,
      user: {
        nama: dataRaw.user_nama || "Anonim",
        email: dataRaw.user_email || "-"
      }
    };

    // PERBAIKAN #2: Gunakan new Response()
    return new Response(JSON.stringify({ data: formattedData }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    console.error("API Error:", error);
    // PERBAIKAN #2: Gunakan new Response()
    return new Response(JSON.stringify({ message: "Internal Server Error", error: error.message }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  } finally {
    if (connection) await connection.end();
  }
}

// --- FUNGSI PUT (Update Status Laporan) ---
export async function PUT(request, { params }) {
  let connection;
  try {
    const { id } = params;
    const { status } = await request.json();

    if (!status) {
      // PERBAIKAN #2: Gunakan new Response()
      return new Response(JSON.stringify({ message: "Status harus diisi" }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    connection = await connectDB();
    await connection.query("UPDATE laporan SET status = ? WHERE laporanID = ?", [status, id]);

    // PERBAIKAN #2: Gunakan new Response()
    return new Response(JSON.stringify({ message: "Status berhasil diupdate" }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    // PERBAIKAN #2: Gunakan new Response()
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  } finally {
    if (connection) await connection.end();
  }
}