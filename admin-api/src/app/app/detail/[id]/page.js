// File: src/app/app/detail/[id]/page.js (KODE LENGKAP PERBAIKAN)

"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import Sidebar from '@/components/Sidebar';
import styles from './Detail.module.css';

export default function DetailPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();

  const [laporan, setLaporan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!id) return;

    fetch(`/api/semua-laporan/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Gagal mengambil data laporan");
        return res.json();
      })
      .then(result => {
        if (result.data) {
          setLaporan(result.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Fetch Error:", err);
        setLoading(false);
      });
  }, [id]);

  // --- FUNGSI UTAMA YANG DIPERBAIKI ---
  async function updateStatus(newStatus) {
    if (!laporan || !id) return;

    // Simpan status asli untuk fallback jika gagal
    const originalStatus = laporan.status;
    // Update UI secara optimis
    setLaporan(prev => ({ ...prev, status: newStatus }));

    try {
      // 1. Update status laporan di database
      await fetch(`/api/semua-laporan/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      // --- PERBAIKAN DIMULAI DI SINI ---
      // 2. Siapkan payload notifikasi
      const notifPayload = {
        userID: laporan.userID, // Pastikan 'userID' ada di data laporan Anda
        type: '',
        title: '',
        body: ''
      };

      // Tentukan isi notifikasi berdasarkan status baru
      if (newStatus === 'Sedang Diproses') {
        notifPayload.type = 'laporan_diterima';
        notifPayload.title = 'Laporan Anda Diterima';
        notifPayload.body = 'Petugas sedang dalam perjalanan menuju lokasi Anda.';
      } else if (newStatus === 'Selesai') {
        notifPayload.type = 'laporan_selesai';
        notifPayload.title = 'Laporan Anda Telah Selesai';
        notifPayload.body = 'Terima kasih telah menggunakan layanan kami. Cek riwayat laporan Anda.';
      }

      // 3. Kirim notifikasi jika ada judul yang sudah di-set
      if (notifPayload.title) {
        await fetch('/api/kirim-notifikasi', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(notifPayload)
        });
      }
      // --- PERBAIKAN SELESAI ---

    } catch (error) {
      console.error("Gagal update atau kirim notif:", error);
      alert("Proses gagal, mengembalikan status semula.");
      // Kembalikan ke status awal jika salah satu proses gagal
      setLaporan(prev => ({ ...prev, status: originalStatus }));
    }
  }
  
  // Sisa kode tidak berubah...
  function formatDateDetail(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    
    const now = new Date();
    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);

    let timeAgo = "";
    if (diffMinutes < 1) timeAgo = "Baru saja";
    else if (diffMinutes < 60) timeAgo = `(${diffMinutes} Menit lalu)`;
    else if (diffHours < 24) timeAgo = `(${diffHours} Jam lalu)`;
    
    return `${date.toLocaleDateString('id-ID', options)} ${timeAgo}`;
  }

  const handleLocationClick = () => {
    if (laporan?.lokasi) {
      window.open(laporan.lokasi, '_blank');
    } else {
      alert("Lokasi tidak tersedia untuk laporan ini.");
    }
  };

  if (loading) {
    return (
      <div className={`${styles.page} ${!sidebarOpen ? styles.sidebarCollapsed : ''}`}>
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} activePage="/detail" />
        <main className={`${styles.content} ${!sidebarOpen ? styles.collapsed : ''}`}>
           <p style={{padding: 40, textAlign: 'center', color: '#888'}}>Memuat Data...</p>
        </main>
      </div>
    );
  }

  if (!laporan) {
    return (
      <div className={`${styles.page} ${!sidebarOpen ? styles.sidebarCollapsed : ''}`}>
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} activePage="/detail" />
        <main className={`${styles.content} ${!sidebarOpen ? styles.collapsed : ''}`}>
           <p style={{padding: 40, textAlign: 'center', color: '#888'}}>Data tidak ditemukan.</p>
        </main>
      </div>
    );
  }

  return (
    <div className={`${styles.page} ${!sidebarOpen ? styles.sidebarCollapsed : ''}`}>
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} activePage="/detail" />
      <div className={styles.topBar}>
        {/* ... sisa kode top bar ... */}
      </div>
      <main className={`${styles.content} ${!sidebarOpen ? styles.collapsed : ''}`}>
        <div className={styles.card}>
          <div className={styles.detailHeader}>
            <div className={styles.titleGroup}>
              <button onClick={() => router.back()} className={styles.backButton}>
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                 </svg>
              </button>
              <h1>{laporan.subject || "Detail Laporan"}</h1>
            </div>

            <div className={styles.metaInfo}>
              <span>{formatDateDetail(laporan.createdAt)}</span>
              <div className={styles.statusActions}>
                <button className={`${styles.statusButton} ${laporan.status === 'baru' ? styles.active : ''}`} onClick={() => updateStatus('baru')}>Laporan Masuk</button>
                <button className={`${styles.statusButton} ${laporan.status === 'Sedang Diproses' ? styles.active : ''}`} onClick={() => updateStatus('Sedang Diproses')}>Sedang Berlangsung</button>
                <button className={`${styles.statusButton} ${laporan.status === 'Selesai' ? styles.active : ''}`} onClick={() => updateStatus('Selesai')}>Selesai</button>
              </div>
            </div>
          </div>

          {/* Bagian Informasi User */}
          <div className={styles.userSection}>
            <div className={styles.avatar}>
              <span>{laporan.user?.nama?.charAt(0)?.toUpperCase() || '?'}</span>
            </div>
            <div className={styles.userInfo}>
              <h4>{laporan.user?.nama || "Anonim"}</h4>
              <p>{laporan.user?.email || "-"}</p>
            </div>
          </div>

          {/* Bagian Isi Laporan */}
          <div className={styles.reportBody}>
            {laporan.isi_laporan ? (
              <p>{laporan.isi_laporan}</p>
            ) : (
              <p style={{ color: '#888', fontStyle: 'italic' }}>Isi laporan tidak tersedia.</p>
            )}
          </div>

          {/* Bagian Gambar jika ada */}
          {laporan.gambar && (
            <div className={styles.imageContainer}>
              <Image
                src={laporan.gambar}
                alt="Gambar laporan"
                width={450}
                height={300}
                className={styles.reportImage}
                priority
              />
            </div>
          )}


          {/* ... sisa kode body laporan ... */}
        </div>

        {/* Tombol Lokasi Fixed di Pojok Kanan Bawah */}
        {laporan.lokasi && (
          <div className={styles.locationFixed}>
            <button onClick={handleLocationClick} className={styles.locationButtonFixed}>
              <Image
                src="/location.png"
                alt="Lokasi"
                width={20}
                height={20}
                className={styles.locationIcon}
              />
              <span>Lokasi</span>
            </button>
          </div>
        )}

      </main>
    </div>
  );
}
