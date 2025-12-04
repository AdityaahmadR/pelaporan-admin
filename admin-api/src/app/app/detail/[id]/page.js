"use client";

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import SearchBar from '@/components/SearchBar';

// PERBAIKAN 1: Hapus atau komentar import yang tidak dipakai untuk menghindari "duplicate identifier"
// import styles from './Detail.module.css'; 
import styles from '@/app/darurat/darurat.module.css'; // Kita pakai yang ini sesuai catatanmu

export default function DetailPage({ params }) {
  const { id } = params;
  const [laporan, setLaporan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // State untuk menyimpan pesan error

  useEffect(() => {
    if (!id) return;

    fetch(`/api/laporan/${id}`)
      .then(async (res) => {
        // Cek apakah response sukses (200 OK)
        if (!res.ok) {
          throw new Error(`Server Error: ${res.status}`); 
        }
        return res.json();
      })
      .then(result => {
        // Pastikan result.data ada isinya
        if (result.data) {
          setLaporan(result.data);
        } else {
          setError("Data laporan tidak ditemukan.");
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Gagal mengambil data:", err);
        setError(err.message); // Simpan pesan error agar tampil di layar
        setLoading(false);
      });
  }, [id]);

  async function updateStatus(newStatus) {
    try {
      const res = await fetch(`/api/laporan/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Gagal update status");

      setLaporan(prev => ({ ...prev, status: newStatus }));
      alert(`Status berhasil diubah menjadi: ${newStatus}`);
    } catch (err) {
      alert("Terjadi kesalahan saat update status.");
    }
  }

  function formatTime(dateString) {
    if (!dateString) return '-';
    const diff = (new Date() - new Date(dateString)) / (1000 * 60 * 60);
    return `${Math.floor(diff)} jam lalu`;
  }

  // Tampilan saat Loading
  if (loading) {
    return (
      <div className={styles.container}>
        <Sidebar />
        <main className={styles.content} style={{ padding: 20 }}>
          <p>Sedang memuat data...</p>
        </main>
      </div>
    );
  }

  // PERBAIKAN 2 & 3: Tampilan saat Error atau Data Kosong (Mencegah Crash)
  if (error || !laporan) {
    return (
      <div className={styles.container}>
        <Sidebar />
        <main className={styles.content} style={{ padding: 20 }}>
          <SearchBar />
          <div className={styles.card} style={{ color: 'red', textAlign: 'center' }}>
            <h3>Terjadi Kesalahan</h3>
            <p>{error || "Data tidak ditemukan"}</p>
            <button onClick={() => window.location.reload()}>Coba Refresh</button>
          </div>
        </main>
      </div>
    );
  }

  // Tampilan Utama (Hanya muncul jika laporan ADA isinya)
  return (
    <div className={styles.container}>
      <Sidebar />
      <main className={styles.content}>
        <SearchBar />

        <div className={styles.card}>
          <h2>Detail Laporan</h2>

          {/* Optional Chaining (?.) digunakan untuk keamanan ekstra */}
          <p><strong>Subject:</strong> {laporan?.subject || '-'}</p>
          <p><strong>Deskripsi:</strong> {laporan?.isi_laporan || '-'}</p>
          <p><strong>Pengguna:</strong> {laporan?.user?.nama || 'Anonim'}</p>
          <p><strong>Waktu:</strong> {formatTime(laporan?.createdAt)}</p>

          <div className={styles.status}>
            <p>Status: <span>{laporan?.status}</span></p>
            <div style={{ marginTop: 10 }}>
                <button onClick={() => updateStatus("Sedang Diproses")} style={{ marginRight: 5 }}>Proses</button>
                <button onClick={() => updateStatus("Selesai")}>Selesai</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}