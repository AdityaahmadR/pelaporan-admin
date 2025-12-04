"use client";

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import SearchBar from '@/components/SearchBar';
import styles from './Detail.module.css';
import styles from '@/app/darurat/darurat.module.css';  // PAKAI CSS YANG SAMA!

export default function DetailPage({ params }) {
  const { id } = params;
  const [laporan, setLaporan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/laporan/${id}`)
      .then(res => res.json())
      .then(result => {
        setLaporan(result.data);
        setLoading(false);
      });
  }, [id]);

  async function updateStatus(newStatus) {
    await fetch(`/api/laporan/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    setLaporan(prev => ({ ...prev, status: newStatus }));
  }

  function formatTime(dateString) {
    if (!dateString) return '-';

    const diff = (new Date() - new Date(dateString)) / (1000 * 60 * 60);
    return `${Math.floor(diff)} jam lalu`;
  }

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;

  return (
    <div className={styles.container}>
      <Sidebar />
      <main className={styles.content}>
        <SearchBar />

        <div className={styles.card}>
          <h2>Detail Laporan</h2>

          <p><strong>Subject:</strong> {laporan.subject || '-'}</p>
          <p><strong>Deskripsi:</strong> {laporan.isi_laporan || '-'}</p>
          <p><strong>Pengguna:</strong> {laporan.user?.nama || '-'}</p>
          <p><strong>Waktu:</strong> {formatTime(laporan.createdAt)}</p>

          <div className={styles.status}>
            <p>Status: <span>{laporan.status}</span></p>
            <button onClick={() => updateStatus("Sedang Diproses")}>Sedang Diproses</button>
            <button onClick={() => updateStatus("Selesai")}>Selesai</button>
          </div>
        </div>
      </main>
    </div>
  );
}
