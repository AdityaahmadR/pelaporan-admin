"use client";

import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import styles from "../darurat/darurat.module.css";
import LaporanPreviewCard from "../../components/LaporanPreviewCard"; // IMPORT PreviewCard

export default function LaporanDarurat() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [laporan, setLaporan] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch laporan dari backend
  useEffect(() => {
    async function fetchData() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/laporan", {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();
        setLaporan(data || []);
      } catch (error) {
        console.error("Gagal fetch laporan:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className={`${styles.page} ${!sidebarOpen ? styles.sidebarCollapsed : ""}`}>
      
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} activePage="/darurat" />

      {/* Top Bar */}
      <div className={styles.topBar}>
        <div className={styles.searchWrapper}>
          <div className={styles.searchBar}>
            <img src="/Search.png" className={styles.searchIcon} width={20} alt="Search Icon" />
            <input type="text" placeholder="Search" className={styles.searchInput} />
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

      {/* CONTENT */}
      <main className={`${styles.content} ${!sidebarOpen ? styles.collapsed : ""}`}>
        
        <header className={styles.header}>
          <h2>Laporan Masyarakat</h2>
        </header>

        {/* LOADING */}
        {loading && <p>Memuat data...</p>}

        {/* EMPTY */}
        {!loading && laporan.length === 0 && (
          <p className={styles.emptyState}>Belum ada laporan darurat</p>
        )}

        {/* LIST PREVIEW */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {laporan.map((item) => (
            <LaporanPreviewCard
              key={item.id}
              title={item.judul}
              description={item.keterangan}
              status={item.status}
            />
          ))}
        </div>

      </main>
    </div>
  );
}
