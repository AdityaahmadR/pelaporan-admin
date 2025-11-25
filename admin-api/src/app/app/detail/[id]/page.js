// src/app/app/detail/[id]/page.js
import Sidebar from '@/components/Sidebar';
import Image from 'next/image';
import Link from 'next/link';
import styles from '../../Detail.module.css';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DetailLaporan({ params }) {
  const { id } = params;

  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/laporan/${id}`, {
    cache: 'no-store'
  });

  if (!res.ok) notFound();
  const laporan = await res.json();

  // Ekstrak gambar dari isi_laporan
  const isiLaporan = laporan.isi_laporan || '';
  const gambarMatch = isiLaporan.match(/(https?:\/\/[^\s]+\.(jpg|jpeg|png|webp|gif))/i);
  const gambarUrl = gambarMatch ? gambarMatch[0] : null;
  const isiBersih = isiLaporan.replace(/(https?:\/\/[^\s]+\.(jpg|jpeg|png|webp|gif))/gi, '').trim();
  const judul = isiBersih.split('\n')[0]?.trim() || 'Laporan Darurat';

  return (
    <div className={styles.page}>
      {/* SIDEBAR */}
      <Sidebar isOpen={true} setIsOpen={() => {}} activePage="/app" />

      {/* TOPBAR */}
      <div className={styles.topBar}>
        <div className={styles.searchWrapper}>
          <div className={styles.searchBar}>
            <Image src="/Search.png" alt="Search" width={20} height={20} className={styles.searchIcon} />
            <input type="text" placeholder="Search" className={styles.searchInput} disabled />
          </div>
        </div>
        <button className={styles.uploadButton}>
          Upload
        </button>
      </div>

      {/* CONTENT */}
      <main className={styles.content}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {/* HEADER + BACK + JUDUL + TOMBOL */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '32px',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <Link href="/app" style={{ 
                fontSize: '36px', 
                color: '#666', 
                textDecoration: 'none',
                fontWeight: '900'
              }}>Back</Link>
              <h1 style={{ 
                margin: 0, 
                fontSize: '36px', 
                fontWeight: '900', 
                color: '#111827',
                lineHeight: '1.2'
              }}>
                {judul}
              </h1>
            </div>
            <button style={{
              background: '#6b7280',
              color: 'white',
              padding: '14px 36px',
              borderRadius: '50px',
              fontWeight: '700',
              fontSize: '16px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(107,114,128,0.3)'
            }}>
              Terima Laporan
            </button>
          </div>

          {/* CARD PELAPOR */}
          <div style={{
            background: '#f8fafc',
            padding: '28px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            marginBottom: '32px',
            boxShadow: '0 6px 20px rgba(0,0,0,0.06)'
          }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: '#e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              fontWeight: '900',
              color: '#374151',
              flexShrink: 0
            }}>
              {laporan.nama_pelapor?.[0]?.toUpperCase() || 'M'}
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 6px', fontSize: '22px', fontWeight: '800', color: '#111827' }}>
                {laporan.nama_pelapor || 'Masyarakat'}
              </h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '15px' }}>
                {laporan.email || '-'}
              </p>
            </div>
            <div style={{ textAlign: 'right', color: '#64748b' }}>
              {new Date(laporan.tanggal).toLocaleDateString('id-ID', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
              })}
              <br />
              <strong style={{ color: '#374151', fontWeight: '600' }}>
                {new Date(laporan.tanggal).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </strong>
            </div>
          </div>

          {/* ISI LAPORAN */}
          <div style={{
            background: 'white',
            padding: '36px',
            borderRadius: '20px',
            boxShadow: '0 10px 35px rgba(0,0,0,0.08)',
            marginBottom: '40px',
            lineHeight: '1.9',
            fontSize: '17.5px',
            color: '#374151',
            whiteSpace: 'pre-wrap',
            border: '1px solid #f1f5f9'
          }}>
            {isiBersih || 'Tidak ada deskripsi.'}
          </div>

          {/* GAMBAR BUKTI */}
          {gambarUrl && (
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <img 
                src={gambarUrl} 
                alt="Bukti laporan"
                style={{
                  maxWidth: '100%',
                  maxHeight: '650px',
                  borderRadius: '24px',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.22)'
                }}
              />
            </div>
          )}

          {/* LOKASI MERAH BERDENYUT */}
          <div style={{
            textAlign: 'right',
            fontSize: '22px',
            fontWeight: '800',
            color: '#dc2626',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: '14px'
          }}>
            <span>Location</span>
            <div style={{
              width: '20px',
              height: '20px',
              background: '#dc2626',
              borderRadius: '50%',
              animation: 'pulse 2s infinite'
            }}></div>
          </div>
        </div>
      </main>

      {/* ANIMASI PULSE */}
      <style jsx>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(220,38,38,0.6); }
          70% { box-shadow: 0 0 0 14px rgba(220,38,38,0); }
          100% { box-shadow: 0 0 0 0 rgba(220,38,38,0); }
        }
      `}</style>
    </div>
  );
}