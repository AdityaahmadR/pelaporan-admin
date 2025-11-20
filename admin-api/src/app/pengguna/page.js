"use client";

import styles from '../app/app.module.css';        // PAKAI CSS YANG SAMA!
import Sidebar from '../../components/Sidebar';
import { useState } from 'react';
import Image from 'next/image';

export default function DatabasePengguna() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className={`${styles.page} ${!sidebarOpen ? styles.sidebarCollapsed : ''}`}>
      {/* SIDEBAR */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} activePage="/pengguna" />

      {/* TOP BAR — 100% SAMA */}
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
        {/* HEADER DUA JUDUL — INI YANG KAMU MAU! */}
        <header className={styles.header} style={{ position: 'relative', paddingBottom: '20px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            width: '100%',
            padding: '0 20px 0 12px'
          }}>
            {/* JUDUL KIRI — Database Masyarakat */}
            <h2 style={{
              margin: 0,
              fontSize: '26px',
              fontWeight: '700',
              color: '#212529',
              position: 'relative',
              paddingRight: '20px'
            }}>
              Database Masyarakat
              <span style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: '-10px',
                height: '4px',
                background: '#d71c1c',
                borderRadius: '2px'
              }}></span>
            </h2>

            {/* JUDUL KANAN — Database Petugas */}
            <h2 style={{
              margin: 0,
              fontSize: '22px',
              fontWeight: '700',
              color: '#d71c1c',
              position: 'relative',
              paddingLeft: '20px'
            }}>
              Database Petugas
              <span style={{
                position: 'absolute',
                left: '20px',
                right: 0,
                bottom: '-10px',
                height: '4px',
                background: '#d71c1c',
                borderRadius: '2px'
              }}></span>
            </h2>
          </div>

          {/* Garis bawah penuh (abu-abu tipis) */}
          <div style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: '1px',
            background: '#e5e7eb'
          }}></div>
        </header>

        {/* KONTEN KOSONG DULU — NANTI ISI DATA */}
        <section className={styles.emptyState}>
          <p>Pilih tab untuk melihat data masyarakat atau petugas</p>
        </section>
      </main>
    </div>
  );
}