"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/app/components/Sidebar";
import SearchBar from "@/app/components/SearchBar";
import "@/app/app/app.module.css";
import styles from "./Detail.module.css";

export default function DetailPage({ params }) {
  const { id } = params;
  const [laporan, setLaporan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [timeAgo, setTimeAgo] = useState("");

  useEffect(() => {
    fetch(`/api/laporan/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setLaporan(data);
        setStatus(data.status);
        updateTimeAgo(data.tanggal);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  // 🕒 HITUNG WAKTU REALTIME
  const updateTimeAgo = (date) => {
    const now = new Date();
    const laporanDate = new Date(date);
    const diff = Math.floor((now - laporanDate) / 60000);

    if (diff < 1) setTimeAgo("Baru saja");
    else if (diff < 60) setTimeAgo(`${diff} menit lalu`);
    else setTimeAgo(`${Math.floor(diff / 60)} jam lalu`);
  };

  // 🔄 UPDATE STATUS KE DATABASE
  const updateStatus = async (value) => {
    setStatus(value);
    await fetch(`/api/laporan/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: value }),
    });
  };

  if (loading) return <p style={{ padding: 20 }}>Memuat...</p>;
  if (!laporan) return <p style={{ padding: 20 }}>Data tidak ditemukan</p>;

  // 🖼️ AMBIL GAMBAR DARI TEKS
  const imageMatch = laporan.deskripsi.match(/https?:\/\/.*\.(jpg|png|jpeg)/);
  const image = imageMatch ? imageMatch[0] : null;

  const subjectMatch = laporan.deskripsi.match(/Subjek:(.*)/i);
  const subject = subjectMatch ? subjectMatch[1].trim() : "Laporan";

  const deskripsiBersih = laporan.deskripsi.replace(/Subjek:(.*)/i, "").trim();

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />

      <main style={{ flex: 1, padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <SearchBar />
          <button
            style={{
              background: "#0066FF",
              color: "white",
              padding: "10px 18px",
              borderRadius: "10px",
              fontWeight: "700",
              border: "none",
              cursor: "pointer",
            }}
          >
            Upload
          </button>
        </div>

        {/* Header */}
        <div className={styles.header}>
          <span onClick={() => history.back()} style={{ cursor: "pointer", fontSize: "30px" }}>⬅</span>
          <h1 className={styles.title}>{subject}</h1>

          <div className={styles.statusContainer}>
            <span style={{ color: "#666", fontSize: "14px" }}>
              {new Date(laporan.tanggal).toLocaleDateString("id-ID")} ({timeAgo})
            </span>

            <select
              className={styles.statusDropdown}
              value={status}
              onChange={(e) => updateStatus(e.target.value)}
            >
              <option value="baru">Baru</option>
              <option value="proses">Sedang Diproses</option>
              <option value="selesai">Selesai</option>
            </select>
          </div>
        </div>

        {/* Identitas pelapor */}
        <div className={styles.pelaporCard}>
          <div className={styles.avatar}>
            {laporan.nama ? laporan.nama.charAt(0).toUpperCase() : "U"}
          </div>
          <div>
            <h3 className={styles.pelaporName}>{laporan.nama || "Masyarakat"}</h3>
            <p className={styles.pelaporEmail}>{laporan.email || "-"}</p>
          </div>
        </div>

        {/* Isi Laporan */}
        <div className={styles.isiLaporan}>{deskripsiBersih}</div>

        {/* Gambar */}
        {image && (
          <div className={styles.gambarContainer}>
            <img src={image} alt="Bukti laporan" />
          </div>
        )}
      </main>
    </div>
  );
}
