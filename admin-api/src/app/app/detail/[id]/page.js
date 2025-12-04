"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import detailStyles from "./Detail.module.css";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function DetailLaporan({ params }) {
  const { id } = params;
  const router = useRouter();

  const [laporan, setLaporan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/laporan/${id}`);
        const data = await res.json();

        setLaporan(data);
        setStatus(data.status || "Laporan Masuk");
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  async function updateStatus(newStatus) {
    setStatus(newStatus);

    await fetch(`/api/laporan/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
  }

  function timeAgo(date) {
    const now = new Date();
    const diff = Math.floor((now - new Date(date)) / 60000);

    if (diff < 1) return "Baru saja";
    if (diff === 1) return "1 menit lalu";
    if (diff < 60) return `${diff} menit lalu`;

    const jam = Math.floor(diff / 60);
    if (jam === 1) return "1 jam lalu";
    return `${jam} jam lalu`;
  }

  if (loading) return <p className={detailStyles.loading}>⏳ Loading...</p>;
  if (!laporan) return <p>Data tidak ditemukan</p>;

  const isiBersih = laporan.deskripsi || "Tidak ada deskripsi.";
  const gambarMatch = isiBersih.match(/(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp))/i);
  const gambarUrl = gambarMatch ? gambarMatch[0] : null;

  const isiTanpaGambar = isiBersih.replace(/(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp))/gi, "").trim();

  return (
    <div className={detailStyles.layout}>
      <Sidebar />

      <main className={detailStyles.main}>
        
        {/* Top Bar */}
        <div className={detailStyles.topBar}>
          <div className={detailStyles.searchBar}>
            <Image src="/Search.png" alt="Search" width={20} height={20} />
            <input type="text" placeholder="Search laporan..." />
          </div>

          <button className={detailStyles.uploadBtn}>
            <Image src="/upload-icon.png" width={16} height={16} alt="upload" />
            Upload
          </button>
        </div>


        {/* Header Title Row */}
        <div className={detailStyles.header}>
          <button className={detailStyles.backBtn} onClick={() => router.back()}>
            ←
          </button>

          <h1 className={detailStyles.title}>{laporan.deskripsi?.split("\n")[0]}</h1>

          <div className={detailStyles.rightInfo}>
            <span className={detailStyles.time}>{timeAgo(laporan.created_at)}</span>

            <select
              className={detailStyles.statusDropdown}
              value={status}
              onChange={(e) => updateStatus(e.target.value)}
            >
              <option value="Laporan Masuk">Laporan Masuk</option>
              <option value="Sedang Diproses">Sedang Diproses</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>
        </div>


        {/* User Info */}
        <div className={detailStyles.userCard}>
          <div className={detailStyles.avatar}>
            {laporan.nama?.charAt(0).toUpperCase() || "U"}
          </div>

          <div>
            <p className={detailStyles.nama}>{laporan.nama || "Pengguna"}</p>
            <p className={detailStyles.email}>{laporan.email || "-"}</p>
          </div>
        </div>


        {/* Deskripsi */}
        <div className={detailStyles.deskripsi}>
          {isiTanpaGambar}
        </div>

        {/* Gambar Bukti */}
        {gambarUrl && (
          <div className={detailStyles.gambarContainer}>
            <img src={gambarUrl} alt="Bukti" />
          </div>
        )}


        {/* Lokasi */}
        <div className={detailStyles.lokasi}>
          <span>📍 Location</span>
          <div className={detailStyles.pulseDot}></div>
        </div>
      </main>
    </div>
  );
}
