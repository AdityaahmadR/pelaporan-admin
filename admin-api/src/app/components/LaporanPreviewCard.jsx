"use client";
import styles from "./LaporanPreviewCard.module.css";
import { useRouter } from "next/navigation";

export default function LaporanPreviewCard({ laporanID, title, description, status }) {
  const router = useRouter();

  const safeTitle = title || "Tanpa Judul";
  // Potong deskripsi jika terlalu panjang agar card tetap rapi
  const safeDescription = description 
    ? (description.length > 60 ? description.substring(0, 60) + "..." : description) 
    : "-";

  // --- LOGIKA WARNA & TEKS ---
  const getStatusConfig = (dbStatus) => {
    // Normalisasi status ke lowercase untuk pengecekan yang aman
    const s = dbStatus?.toLowerCase() || "";

    if (s === 'baru' || s === 'laporan masuk') {
      return { 
        text: "Laporan Masuk", 
        color: "#959595", 
        textColor: "#FFFFFF" // Putih biar kontras di abu-abu
      };
    }
    if (s === 'sedang diproses' || s === 'sedang berlangsung') {
      return { 
        text: "Sedang Berlangsung", 
        color: "#FFC300", 
        textColor: "#000000" // Hitam biar terbaca di kuning terang
      };
    }
    if (s === 'selesai') {
      return { 
        text: "Selesai", 
        color: "#3BFF00", 
        textColor: "#000000" // Hitam biar terbaca di hijau neon
      };
    }

    // Default fallback
    return { text: dbStatus, color: "#959595", textColor: "#FFFFFF" };
  };

  const statusConfig = getStatusConfig(status);

  return (
    <div
      className={styles.card}
      onClick={() => router.push(`/detail/${laporanID}`)} 
      style={{ cursor: "pointer" }}
    >
      {/* BAGIAN KIRI: TEKS */}
      <div className={styles.textSection}>
        <h3 className={styles.title}>{safeTitle}</h3>
        <p className={styles.desc}>{safeDescription}</p>
      </div>

      {/* BAGIAN KANAN: BADGE STATUS (Bukan Dropdown lagi) */}
      <div className={styles.statusWrapper}>
        <span 
          className={styles.statusBadge}
          style={{ 
            backgroundColor: statusConfig.color,
            color: statusConfig.textColor
          }}
        >
          {statusConfig.text}
        </span>
      </div>
    </div>
  );
}