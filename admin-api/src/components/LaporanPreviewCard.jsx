// src/components/LaporanPreviewCard.jsx
import { useRouter } from 'next/navigation';
import styles from './LaporanPreviewCard.module.css';

export default function LaporanPreviewCard({ laporan }) {
  const router = useRouter();
  const { laporanID, isi_laporan, nama_pelapor, email, tanggal } = laporan;

  // Ambil judul dari baris pertama
  const judul = isi_laporan.split('\n')[0].trim() || 'Laporan Darurat';

  // Ambil isi tanpa judul
  const isi = isi_laporan.split('\n').slice(1).join('\n').trim() || isi_laporan;

  const handleClick = () => {
    router.push(`/app/detail/${laporanID}`);
  };

  return (
    <div className={styles.card} onClick={handleClick}>
      <div className={styles.header}>
        <h3 className={styles.judul}>{judul}</h3>
        <span className={styles.badge}>Laporan Masuk</span>
      </div>

      <p className={styles.isi}>{isi || 'Tidak ada deskripsi tambahan.'}</p>

      <div className={styles.footer}>
        <span className={styles.time}>
          {new Date(tanggal).toLocaleString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}
        </span>
      </div>
    </div>
  );
}