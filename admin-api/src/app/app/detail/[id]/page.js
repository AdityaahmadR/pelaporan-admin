"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Sidebar from '@/components/Sidebar';
import styles from './Detail.module.css';

export default function DetailPage({ params }) {
  const { id } = params;
  const router = useRouter(); // Router sudah terdefinisi
  
  const [laporan, setLaporan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    fetch(`/api/laporan/${id}`)
      .then(res => res.json())
      .then(result => {
        if (result.data) setLaporan(result.data);
        setLoading(false);
      })
      .catch(err => setLoading(false));
  }, [id]);

  async function updateStatus(newStatus) {
    if(!laporan) return;
    setLaporan(prev => ({ ...prev, status: newStatus })); 
    try {
      await fetch(`/api/semua-laporan/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (error) {
      alert("Gagal update status");
    }
  }

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
        <div className={styles.searchWrapper}>
          <div className={styles.searchBar}>
            <Image src="/Search.png" alt="Search" width={18} height={18} className={styles.searchIcon} />
            <input type="text" placeholder="Search" className={styles.searchInput} />
          </div>
        </div>
        
        {/* 1. UPDATE TOMBOL UPLOAD DI SINI */}
        <button 
          className={styles.uploadButton}
          onClick={() => router.push('/edukasi')} // Navigasi ke Edukasi
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span>Upload</span>
        </button>
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
              <h1 className={styles.detailTitle}>{laporan.subject}</h1>
            </div>

            <div className={styles.metaInfo}>
              <span className={styles.dateText}>{formatDateDetail(laporan.createdAt)}</span>
              <div className={styles.statusActions}>
                <button 
                  className={`${styles.statusButton} ${laporan.status === 'baru' ? styles.active : ''}`}
                  onClick={() => updateStatus('baru')}
                >
                  Laporan Masuk
                </button>
                <button 
                  className={`${styles.statusButton} ${laporan.status === 'Sedang Diproses' ? styles.active : ''}`}
                  onClick={() => updateStatus('Sedang Diproses')}
                >
                  Sedang Berlangsung
                </button>
                <button 
                  className={`${styles.statusButton} ${laporan.status === 'Selesai' ? styles.active : ''}`}
                  onClick={() => updateStatus('Selesai')}
                >
                  Selesai
                </button>
              </div>
            </div>
          </div>

          <div className={styles.userSection}>
            <div className={styles.avatar}>
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
               </svg>
            </div>
            <div className={styles.userInfo}>
              <h4>{laporan.user?.nama}</h4>
              <p>{laporan.user?.email}</p>
            </div>
          </div>

          <div className={styles.reportBody}>
            {laporan.isi_laporan}
          </div>

          {laporan.gambar ? (
             <div className={styles.imageContainer}>
                <img src={laporan.gambar} alt="Bukti Laporan" className={styles.reportImage} />
             </div>
          ) : (
            <p style={{fontSize:'13px', color: '#aaa', fontStyle: 'italic'}}>*Tidak ada lampiran gambar</p>
          )}

        </div>
      </main>
    </div>
  );
}

//test