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
        {/* HEADER DUA TAB — INI YANG KAMU MAU! */}
        <header className={styles.header} style={{ paddingBottom: '32px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '40px',
            position: 'relative',
            paddingLeft: '12px'
          }}>
            {/* TAB MASYARAKAT */}
            <h2
              onClick={() => setActiveTab('masyarakat')}
              style={{
                margin: 0,
                fontSize: '26px',
                fontWeight: '700',
                color: '#212529',
                cursor: 'pointer',
                position: 'relative',
                transition: 'color 0.2s ease'
              }}
            >
              Database Masyarakat
              {activeTab === 'masyarakat' && (
                <span style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: '-10px',
                  height: '4px',
                  background: '#d71c1c',
                  borderRadius: '2px',
                  transition: 'all 0.3s ease'
                }}></span>
              )}
            </h2>

            {/* TAB PETUGAS */}
            <h2
              onClick={() => setActiveTab('petugas')}
              style={{
                margin: 0,
                fontSize: '26px',
                fontWeight: '700',
                color: '#212529',
                cursor: 'pointer',
                position: 'relative',
                transition: 'color 0.2s ease'
              }}
            >
              Database Petugas
              {activeTab === 'petugas' && (
                <span style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: '-10px',
                  height: '4px',
                  background: '#d71c1c',
                  borderRadius: '2px',
                  transition: 'all 0.3s ease'
                }}></span>
              )}
            </h2>
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

        {/* ISI KONTEN — NANTI TERGANTUNG TAB */}
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