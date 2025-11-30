// src/app/app/detail/[id]/page.js
import detailStyles from './Detail.module.css';

export const dynamic = 'force-dynamic';

export default async function DetailLaporan({ params }) {
  const { id } = params;
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/laporan/${id}`, {
    cache: 'no-store'
  });

  if (!res.ok) return <div className={detailStyles.container}>Laporan tidak ditemukan</div>;
  const laporan = await res.json();

  const isi = String(laporan.isi_laporan || '');
  const gambarMatch = isi.match(/(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp))/i);
  const gambarUrl = gambarMatch ? gambarMatch[0] : null;
  const isiBersih = isi.replace(/(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp))/gi, '').trim();
  const judul = isiBersih.split('\n')[0] || 'Laporan Darurat';

  return (
    <div className={detailStyles.container}>

      {/* Header + Back + Terima */}
      <div className={detailStyles.header}>
        <a href="/app" className={detailStyles.backLink}>←</a>
        <h1 className={detailStyles.title}>{judul}</h1>
        <button className={detailStyles.terimaButton}>Terima Laporan</button>
      </div>

      {/* Info Pelapor */}
      <div className={detailStyles.pelaporCard}>
        <div className={detailStyles.avatar}>
          {laporan.nama_pelapor?.[0] || 'A'}
        </div>
        <div>
          <h3 className={detailStyles.pelaporName}>{laporan.nama_pelapor || 'Masyarakat'}</h3>
          <p className={detailStyles.pelaporEmail}>{laporan.email || '-'}</p>
        </div>
        <div className={detailStyles.waktu}>
          {new Date(laporan.tanggal).toLocaleDateString('id-ID', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
          })}
          <br />
          <strong>1 menit lalu</strong>
        </div>
      </div>

      {/* Isi Laporan */}
      <div className={detailStyles.isiLaporan}>
        {isiBersih || 'Tidak ada deskripsi.'}
      </div>

      {/* Gambar (jika ada) */}
      {gambarUrl && (
        <div className={detailStyles.gambarContainer}>
          <img src={gambarUrl} alt="Bukti laporan" />
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