"use client";

import { useState, useEffect, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import styles from './Edukasi.module.css';

export default function EdukasiPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // State Data
  const [videos, setVideos] = useState([]);
  const [newsLink, setNewsLink] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Ref untuk input file hidden
  const fileInputRef = useRef(null);

  // 1. FETCH DATA (Saat halaman dibuka)
  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const res = await fetch('/api/edukasi');
      const data = await res.json();
      if (Array.isArray(data)) {
        setVideos(data);
      }
    } catch (error) {
      console.error("Gagal ambil video:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. FUNGSI UPLOAD VIDEO (Simulasi ke Database)
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Karena ini serverless (Vercel), kita simpan Nama File saja ke DB
    // sebagai tanda video sudah diupload.
    const videoData = {
      judul: file.name,           // Simpan nama file (contoh: video.mp4)
      isi: "/placeholder.mp4",    // Path dummy sementara
      kategori: "video"
    };

    try {
      const res = await fetch('/api/edukasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(videoData)
      });

      if (res.ok) {
        alert("Video berhasil diunggah!");
        fetchVideos(); // Refresh daftar video otomatis
      } else {
        alert("Gagal upload video");
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  // Trigger klik input file saat tombol merah diklik
  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  // 3. FUNGSI SIMPAN BERITA (Enter)
  const handleNewsSubmit = async (e) => {
    if (e.key === 'Enter') {
      if (!newsLink) return;

      const beritaData = {
        judul: "Berita Eksternal", 
        isi: newsLink,
        kategori: "berita"
      };

      try {
        const res = await fetch('/api/edukasi', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(beritaData)
        });

        if (res.ok) {
          alert("Link berita berhasil disimpan!");
          setNewsLink(""); // Reset input
        }
      } catch (err) {
        alert("Gagal simpan berita");
      }
    }
  };

  return (
    <div className={`${styles.page} ${!sidebarOpen ? styles.sidebarCollapsed : ''}`}>
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} activePage="/edukasi" />

      <main className={styles.content}>
        
        {/* SECTION 1: UPLOAD BOX */}
        <div className={styles.uploadContainer}>
          <div className={styles.uploadIcon}>
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>
          
          <h2 className={styles.uploadText}>Masukkan video anda untuk mengunggah</h2>
          
          {/* Input File Tersembunyi */}
          <input 
            type="file" 
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept="video/*" 
            onChange={handleFileChange}
          />

          <button className={styles.selectFileButton} onClick={handleButtonClick}>
            Pilih File
          </button>
        </div>

        {/* SECTION 2: BERITA INPUT */}
        <div className={styles.newsInputContainer}>
          <h3 className={styles.sectionTitle}>Masukkan Berita Anda</h3>
          <input 
            type="text" 
            placeholder="Masukkan Link Berita lalu Tekan Enter..." 
            className={styles.newsInput}
            value={newsLink}
            onChange={(e) => setNewsLink(e.target.value)}
            onKeyDown={handleNewsSubmit} 
          />
        </div>

        {/* SECTION 3: LIST VIDEO */}
        <div className={styles.videoSection}>
          <h3 className={styles.sectionTitle}>Video Anda</h3>
          
          <div className={styles.videoGrid}>
            {loading && <p>Memuat video...</p>}
            
            {!loading && videos.length === 0 && (
              <p style={{color:'#999', fontStyle:'italic'}}>Belum ada video diunggah.</p>
            )}

            {videos.map((video) => (
              <div key={video.edukasiID} className={styles.videoCard}>
                <div className={styles.thumbnailPlaceholder}>
                  {/* Icon Play Placeholder */}
                  <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="23 7 16 12 23 17 23 7"></polygon>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                  </svg>
                </div>
                <div className={styles.videoInfo}>
                  {/* Menampilkan Judul dari Database */}
                  <p className={styles.videoTitle}>{video.judul || "Video Tanpa Judul"}</p>
                  
                  {/* Menampilkan Tanggal Upload */}
                  <p style={{fontSize: '12px', color:'#777', marginTop: '5px', margin: 0}}>
                    {video.tanggalPublikasi ? new Date(video.tanggalPublikasi).toLocaleDateString('id-ID') : '-'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}