// src/app/app/page.js
"use client";

import styles from './app.module.css';
import Sidebar from '../../components/Sidebar';
import { useState } from 'react';
import Image from 'next/image';

export default function AppPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className={`${styles.page} ${!sidebarOpen ? styles.sidebarCollapsed : ''}`}>

      {/* SIDEBAR — TAMBAH activePage="/app" */}
      <Sidebar 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
        activePage="/app" 
      />

      {/* TOP BAR */}
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
              placeholder="Search"
              className={styles.searchInput}
            />
          </div>
        </div>

        <button className={styles.uploadButton}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span>Upload</span>
        </button>
      </div>

      {/* KONTEN UTAMA */}
      <main className={`${styles.content} ${!sidebarOpen ? styles.collapsed : ''}`}>
        <header className={styles.header}>
          <h2>Laporan Masyarakat</h2>
        </header>

        <section className={styles.emptyState}>
          <p>Belum ada laporan manual</p>
        </section>
      </main>
    </div>
  );
}