"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/app/components/Sidebar";
import LaporanPreviewCard from "@/app/components/LaporanPreviewCard";
import styles from "@/app/darurat/darurat.module.css";
import Image from "next/image";

export default function LaporanPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [laporan, setLaporan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/laporan");

        if (!res.ok) throw new Error(`Error: ${res.status}`);

        const data = await res.json();
        setLaporan(Array.isArray(data) ? data : []);

      } catch (err) {
        setFetchError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const filteredLaporan = laporan.filter((item) =>
    item.deskripsi?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`${styles.page} ${!sidebarOpen ? styles.sidebarCollapsed : ""}`}>

      {/* SIDEBAR */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} activePage="/app" />

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
              placeholder="Search laporan..."
              className={styles.searchInput}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <button className={styles.uploadButton} onClick={() => alert("Upload fitur belum aktif ⚠")}>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
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

        {loading && <p>⏳ Mengambil data...</p>}
        {fetchError && <p style={{ color: "red" }}>⚠ {fetchError}</p>}

        {!loading && filteredLaporan.length === 0 && (
          <p className={styles.emptyState}>🚫 Tidak ada laporan ditemukan</p>
        )}

        {/* LIST */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {filteredLaporan.map((item) => (
            <LaporanPreviewCard
              key={item.laporanID}
              laporanID={item.laporanID}  
              title={item.deskripsi?.split("\n")[0] || "Tanpa Judul"}
              description={item.deskripsi}
              status={item.status}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
