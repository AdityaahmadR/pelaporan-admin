"use client";

import { useState } from 'react';
import Sidebar from '@/components/Sidebar'; // Pastikan path sidebar benar
import styles from './Edukasi.module.css';

export default function EdukasiPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Data dummy untuk contoh tampilan "Video Anda"
  const dummyVideos = [
    {
      id: 1,
      title: "Cara Memadamkan Api Dengan Baik dan Benar",
      thumbnail: "https://i.ibb.co/1fYKT5sb/b92bb4c90cef.jpg" // Gambar placeholder (bisa diganti)
    }
  ];

  return (
    <div className={`${styles.page} ${!sidebarOpen ? styles.sidebarCollapsed : ''}`}>
      {/* 1. SIDEBAR */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} activePage="/edukasi" />

      {/* 2. KONTEN UTAMA */}
      <main className={styles.content}>
        
        {/* SECTION 1: UPLOAD BOX */}
        <div className={styles.uploadContainer}>
          {/* Icon Upload (Panah ke atas) */}
          <div className={styles.uploadIcon}>
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>
          
          <h2 className={styles.uploadText}>Masukkan video anda untuk mengunggah</h2>
          
          <button className={styles.selectFileButton}>
            Pilih File
          </button>
        </div>

        {/* SECTION 2: BERITA INPUT */}
        <div className={styles.newsInputContainer}>
          <h3 className={styles.sectionTitle}>Masukkan Berita Anda</h3>
          <input 
            type="text" 
            placeholder="Masukkan Link..." 
            className={styles.newsInput}
          />
        </div>

        {/* SECTION 3: LIST VIDEO */}
        <div className={styles.videoSection}>
          <h3 className={styles.sectionTitle}>Video Anda</h3>
          
          <div className={styles.videoGrid}>
            {dummyVideos.map((video) => (
              <div key={video.id} className={styles.videoCard}>
                <div className={styles.thumbnailPlaceholder}>
                  {/* Gunakan img tag biasa atau next/image */}
                  <img 
                    src={video.thumbnail} 
                    alt="Thumbnail" 
                    className={styles.thumbnailImage}
                    onError={(e) => {e.target.style.display='none'}} // Fallback jika gambar error
                  />
                </div>
                <div className={styles.videoInfo}>
                  <p className={styles.videoTitle}>{video.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}