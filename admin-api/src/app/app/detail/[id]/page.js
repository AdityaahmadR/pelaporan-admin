"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import SearchBar from "@/components/SearchBar";
import UploadButton from "@/components/UploadButton";
import styles from "../../darurat/darurat.module.css";

export default function DetailPage({ params }) {
  const router = useRouter();
  const { id } = params;

  const [laporan, setLaporan] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [timeAgo, setTimeAgo] = useState("");

  // Fetch detail laporan
  useEffect(() => {
    async function fetchDetail() {
      try {
        const res = await fetch(`/api/laporan/${id}`);
        const data = await res.json();
        setLaporan(data);
        generateTimeAgo(data?.tanggal);
      } catch (e) {
        console.error("Fetch gagal:", e);
      }
    }

    fetchDetail();
  }, [id]);

  const generateTimeAgo = (timestamp) => {
    if (!timestamp) return setTimeAgo("Tidak diketahui");

    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now - date;

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor(diffMs / (1000 * 60));

    if (hours >= 1) {
      setTimeAgo(`${hours} jam lalu`);
    } else {
      setTimeAgo(`${minutes} menit lalu`);
    }
  };

  // Update status laporan
  const updateStatus = async (newStatus) => {
    try {
      const res = await fetch(`/api/laporan/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setLaporan({ ...laporan, status: newStatus });
      }
    } catch (e) {
      console.error("Gagal update status:", e);
    }
  };

  if (!laporan) return <p style={{ padding: 20 }}>Memuat detail...</p>;

  const subject = laporan.deskripsi?.split("\n")[0] ?? "Tanpa Judul";

  const imageMatch = laporan.deskripsi?.match(/(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp))/i);
  const imageUrl = imageMatch ? imageMatch[0] : null;

  const cleanText = laporan.deskripsi?.replace(imageUrl, "").trim();

  return (
    <div className={`${styles.page} ${!sidebarOpen ? styles.sidebarCollapsed : ""}`}>
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} activePage="/laporan" />

      <main className={`${styles.content} ${!sidebarOpen ? styles.collapsed : ""}`}>
        
        {/* SEARCH + UPLOAD (harus sama seperti halaman list) */}
        <div className={styles.topBar}>
          <SearchBar />
          <UploadButton />
        </div>

        {/* Back Button */}
        <button
          onClick={() => router.back()}
          style={{
            marginTop: "20px",
            border: "none",
            background: "#e5e7eb",
            padding: "10px 16px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          ← Kembali
        </button>

        {/* Title */}
        <h1 style={{ marginTop: "20px", fontSize: "32px", fontWeight: "900" }}>{subject}</h1>

        {/* Time */}
        <p style={{ margin: "6px 0", color: "#6b7280" }}>
          Diterima: <strong>{timeAgo}</strong>
        </p>

        {/* Status Dropdown */}
        <select
          value={laporan.status}
          onChange={(e) => updateStatus(e.target.value)}
          style={{
            marginTop: "10px",
            padding: "10px 16px",
            borderRadius: "10px",
            border: "1px solid #ddd",
            fontSize: "15px",
          }}
        >
          <option value="baru">📩 Laporan Masuk</option>
          <option value="sedang berlangsung">⏳ Sedang Berlangsung</option>
          <option value="selesai">✅ Selesai</option>
        </select>

        {/* Detail Content */}
        <div
          style={{
            marginTop: "30px",
            background: "white",
            padding: "22px",
            borderRadius: "12px",
            whiteSpace: "pre-wrap",
            lineHeight: 1.7,
            border: "1px solid #eee",
          }}
        >
          {cleanText}
        </div>

        {/* Image */}
        {imageUrl && (
          <img
            src={imageUrl}
            style={{
              marginTop: "20px",
              width: "100%",
              borderRadius: "14px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            }}
            alt="Bukti laporan"
          />
        )}
      </main>
    </div>
  );
}
