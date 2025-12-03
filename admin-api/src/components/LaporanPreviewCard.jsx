"use client";
import styles from "./LaporanPreviewCard.module.css";
import { useState } from "react";

export default function LaporanPreviewCard({ title, description, status }) {
  const [currentStatus, setCurrentStatus] = useState(status || "Laporan Masuk");

  const statusStyle = {
    "Laporan Masuk": styles.badgeMasuk,
    "Sedang Diproses": styles.badgeProses,
    "Selesai": styles.badgeSelesai,
  };

  const handleChange = (value) => {
    setCurrentStatus(value);
  };

  return (
    <div className={styles.card}>
      {/* Left Section: Title + Description */}
      <div className={styles.textSection}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.desc}>{description}</p>
      </div>

      {/* Right: Status Dropdown */}
      <div className={styles.dropdownWrapper}>
        <select
          className={`${styles.dropdown} ${statusStyle[currentStatus]}`}
          value={currentStatus}
          onChange={(e) => handleChange(e.target.value)}
        >
          <option value="Laporan Masuk">Laporan Masuk</option>
          <option value="Sedang Diproses">Sedang Diproses</option>
          <option value="Selesai">Selesai</option>
        </select>
      </div>
    </div>
  );
}
