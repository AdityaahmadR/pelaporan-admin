"use client";

import styles from '../app/app.module.css';
import Sidebar from '../../components/Sidebar';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

export default function DatabasePengguna() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('masyarakat');

  const masyarakatRef = useRef(null);
  const petugasRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({});

  useEffect(() => {
    const activeEl = activeTab === 'masyarakat' ? masyarakatRef.current : petugasRef.current;
    if (activeEl) {
      setIndicatorStyle({
        left: `${activeEl.offsetLeft}px`,
        width: `${activeEl.offsetWidth}px`,
        transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)'
      });
    }
  }, [activeTab]);

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
        {/* HEADER DUA TAB — INI YANG 100% SESUAI GAMBAR 2! */}
        <header className={styles.header} style={{ paddingBottom: '32px', position: 'relative' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '48px',
            paddingLeft: '12px',
            position: 'relative'
          }}>
            {/* TAB MASYARAKAT */}
            <h2
              ref={masyarakatRef}
              onClick={() => setActiveTab('masyarakat')}
              style={{
                margin: 0,
                fontSize: '26px',
                fontWeight: activeTab === 'masyarakat' ? '800' : '700',
                color: '#212529',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
                zIndex: 2
              }}
            >
              Database Masyarakat
            </h2>

            {/* TAB PETUGAS */}
            <h2
              ref={petugasRef}
              onClick={() => setActiveTab('petugas')}
              style={{
                margin: 0,
                fontSize: '26px',
                fontWeight: activeTab === 'petugas' ? '800' : '700',
                color: '#212529',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
                zIndex: 2
              }}
            >
              Database Petugas
            </h2>

            {/* GARIS MERAH SATU-SATUNYA — MENGIKUTI PANJANG TEKS! */}
            <div style={{
              position: 'absolute',
              bottom: '12px',
              height: '4px',
              background: '#d71c1c',
              borderRadius: '2px',
              zIndex: 1,
              ...indicatorStyle
            }}></div>
          </div>

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