"use client";

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './Monitoring.module.css';

export default function MonitoringPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();

  return (
    <div className={styles.page}>
      {/* 1. SIDEBAR (Aktif di menu Monitoring) */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} activePage="/monitoring" />

      {/* 2. TOP BAR */}
      <div className={`${styles.topBar} ${!sidebarOpen ? styles.sidebarCollapsed : ''}`}>
        <div className={styles.searchWrapper}>
          <div className={styles.searchBar}>
            <Image src="/Search.png" alt="Search" width={18} height={18} className={styles.searchIcon} />
            <input type="text" placeholder="Search" className={styles.searchInput} />
          </div>
        </div>
        
        {/* Tombol Upload (Navigasi ke Edukasi, sama seperti halaman lain) */}
        <button 
          className={styles.uploadButton}
          onClick={() => router.push('/edukasi')} 
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span>Upload</span>
        </button>
      </div>

      {/* 3. KONTEN UTAMA */}
      <main className={`${styles.content} ${!sidebarOpen ? styles.collapsed : ''}`}>
        
        {/* Judul Halaman */}
        <div className={styles.header}>
          <h2 className={styles.title}>Monitoring Sensor</h2>
        </div>

        {/* Area kosong untuk Komponen Sensor (Langkah Selanjutnya) */}
        <div className={styles.sensorContainer}>
           <p style={{color: '#888'}}>Menunggu komponen sensor...</p>
        </div>

      </main>
    </div>
  );
}

//test