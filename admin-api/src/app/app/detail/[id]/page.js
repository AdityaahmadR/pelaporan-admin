// src/app/app/detail/[id]/page.js
import detailStyles from './Detail.module.css';

export const dynamic = 'force-dynamic';

export default async function DetailLaporan({ params }) {
  const { id } = params;

  // INI YANG DIUBAH: Pakai relative URL → otomatis work di Vercel
  const res = await fetch(`/api/laporan/${id}`, { cache: 'no-store' });

  if (!res.ok) {
    return (
      <div className={detailStyles.container} style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
        <h2>Laporan tidak ditemukan</h2>
        <a href="/app" style={{ color: '#d32f2f', textDecoration: 'none' }}>← Kembali ke Daftar Laporan</a>
      </div>
    );
  }

  const laporan = await res.json();

  const isi = String(laporan.isi_laporan || laporan.deskripsi || '');
  const gambarMatch = isi.match(/(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp))/i);
  const gambarUrl = gambarMatch ? gambarMatch[0] : null;
  const isiBersih = isi.replace(/(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp))/gi, '').trim();
  const judul = isiBersih.split('\n')[0]?.trim() || 'Laporan Darurat';

  return (
    <div className={detailStyles.container}>
      {/* Header dengan Back & Tombol Terima */}
      <div className={detailStyles.header}>
        <a href="/app" className={detailStyles.backLink}>←</a>
        <h1 className={detailStyles.title}>{judul}</h1>
        <button className={detailStyles.terimaButton}>Terima Laporan</button>
      </div>

      {/* Info Pelapor */}
      <div className={detailStyles.pelaporCard}>
        <div className={detailStyles.avatar}>
          {laporan.nama_pelapor?.[0]?.toUpperCase() || 'A'}
        </div>
        <div>
          <h3 className={detailStyles.pelaporName}>{laporan.nama_pelapor || 'Masyarakat'}</h3>
          <p className={detailStyles.pelaporEmail}>{laporan.email || 'Tidak ada email'}</p>
        </div>
        <div className={detailStyles.waktu}>
          {new Date(laporan.tanggal || Date.now()).toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}
          <br />
          <strong>1 menit lalu</strong>
        </div>
      </div>

      {/* Isi Laporan */}
      <div className={detailStyles.isiLaporan}>
        {isiBersih || 'Tidak ada deskripsi tersedia.'}
      </div>

      {/* Gambar (jika ada) */}
      {gambarUrl && (
        <div className={detailStyles.gambarContainer}>
          <img src={gambarUrl} alt="Bukti laporan" 
               onError={(e) => { e.target.style.display = 'none'; }} // Hide kalau gambar error
          />
        </div>
      )}

      {/* Tombol Location */}
      <div className={detailStyles.lokasi}>
        <div className={detailStyles.pulseDot}></div>
        <span>Location</span>
      </div>
    </div>
  );
}