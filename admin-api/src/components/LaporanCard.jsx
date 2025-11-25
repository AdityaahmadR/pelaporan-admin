// src/components/LaporanCard.jsx
import styles from './LaporanCard.module.css';
import Image from 'next/image';

export default function LaporanCard({ laporan }) {
  const { isi_laporan, nama_pelapor, tanggal } = laporan;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.judul}>Laporan Darurat</h3>
        <span className={styles.badge}>Laporan Masuk</span>
      </div>

      <p className={styles.isi}>{isi_laporan}</p>

      <div className={styles.footer}>
        <div className={styles.pelaporInfo}>
          <div className={styles.avatar}>
            {nama_pelapor?.[0]?.toUpperCase() || 'M'}
          </div>
          <div>
            <div className={styles.nama}>{nama_pelapor || 'Masyarakat'}</div>
            <div className={styles.tanggal}>
              {new Date(tanggal).toLocaleString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>

        <button className={styles.tombolDetail}>
          Lihat Detail →
        </button>
      </div>
    </div>
  );
}