"use client";

import styles from '../app/app.module.css';
import Sidebar from '../../components/Sidebar';
import { useState } from 'react';
import Image from 'next/image';

export default function DatabasePengguna() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('masyarakat'); // masyarakat atau petugas

  return (
    <div className={`${styles.page} ${!sidebarOpen ? styles.sidebarCollapsed : ''}`}>
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} activePage="/pengguna" />

      {/* TOP BAR */}
      <div className={styles.topBar}>
        <div className={styles.searchWrapper}>
          <div className={styles.searchBar}>
            <Image src="/Search.png" alt="Search" width={20} height={20} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Cari nama, email, atau nomor telepon..."
              className={styles.searchInput}
            />
          </div>
        </div>
        <button className={styles.uploadButton}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14m-7-7h14" />
          </svg>
          <span>Tambah Pengguna</span>
        </button>
      </div>

      {/* KONTEN UTAMA */}
      <main className={`${styles.content} ${!sidebarOpen ? styles.collapsed : ''}`}>
        {/* HEADER DUA TAB — VERSI YANG BENAR-BENAR HANYA SATU GARIS! */}
        <header className={styles.header} style={{ paddingBottom: '32px', position: 'relative' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '40px',
            paddingLeft: '12px'
          }}>
            {/* TAB MASYARAKAT */}
            <h2
              onClick={() => setActiveTab('masyarakat')}
              style={{
                margin: 0,
                fontSize: '26px',
                fontWeight: activeTab === 'masyarakat' ? '800' : '700',
                color: '#212529',
                cursor: 'pointer',
                position: 'relative',
                paddingBottom: '12px',
                transition: 'all 0.3s ease'
              }}
            >
              Database Masyarakat
            </h2>

            {/* TAB PETUGAS */}
            <h2
              onClick={() => setActiveTab('petugas')}
              style={{
                margin: 0,
                fontSize: '26px',
                fontWeight: activeTab === 'petugas' ? '800' : '700',
                color: '#212529',
                cursor: 'pointer',
                position: 'relative',
                paddingBottom: '12px',
                transition: 'all 0.3s ease'
              }}
            >
              Database Petugas
            </h2>
          </div>

          {/* GARIS MERAH SATU-SATUNYA — HANYA MUNCUL DI TAB AKTIF! */}
          <div style={{
            position: 'absolute',
            left: activeTab === 'masyarakat' ? '12px' : 'calc(12px + 230px)', // 230px ≈ lebar "Database Masyarakat" + gap
            bottom: '16px',
            width: '200px',
            height: '4px',
            background: '#d71c1c',
            borderRadius: '2px',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: activeTab === 'petugas' ? 'translateX(230px)' : 'translateX(0)'
          }}></div>

          {/* Garis bawah penuh */}
          <div style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: '1px',
            background: '#e5e7eb'
          }}></div>
        </header>

        {/* ISI KONTEN */}
        <section className={styles.emptyState}>
          <p>
            {activeTab === 'masyarakat' 
              ? 'Menampilkan data masyarakat...' 
              : 'Menampilkan data petugas...'
            }
          </p>
        </section>
      </main>
    </div>
  );
}