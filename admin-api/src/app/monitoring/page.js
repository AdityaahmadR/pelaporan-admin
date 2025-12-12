"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Sidebar from '@/components/Sidebar';
import styles from './monitoring.module.css'; // Import Module CSS Khusus Monitoring

export default function MonitoringPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();

  return (
    // Class page & sidebarCollapsed untuk mengatur layout responsive
    <div className={`${styles.page} ${!sidebarOpen ? styles.sidebarCollapsed : ''}`}>
      
      {/* 1. SIDEBAR */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} activePage="/monitoring" />

      {/* 2. TOP BAR */}
      <div className={styles.topBar}>
        <div className={styles.searchWrapper}>
          <div className={styles.searchBar}>
            <Image 
              src="/Search.png" 
              alt="Search" 
              width={20} 
              height={20} 
              className={styles.searchIcon} 
            />
            <input 
              type="text" 
              placeholder="Search Sensor..." 
              className={styles.searchInput} 
            />
          </div>
        </div>
        
        {/* Tombol Upload (Konsisten mengarah ke Edukasi) */}
        <button 
          className={styles.uploadButton}
          onClick={() => router.push('/edukasi')} 
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 1-2 2H5a2 2 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span>Upload</span>
        </button>
      </div>

      {/* 3. KONTEN UTAMA */}
      <main className={`${styles.content} ${!sidebarOpen ? styles.collapsed : ''}`}>
        
        {/* HEADER HALAMAN */}
        <header className={styles.header}>
          <h2>Monitoring Sensor</h2>
        </header>

        {/* CONTAINER UTAMA (Nanti diisi komponen sensor) */}
        <div className={styles.sensorCard}>
           <p>Area Grafik Sensor & CCTV akan muncul di sini</p>
        </div>

      </main>
    </div>
  );
}