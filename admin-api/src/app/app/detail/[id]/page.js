// src/app/app/detail/[id]/page.js
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default async function DetailLaporan({ params }) {
  const { id } = params;
  const res = await fetch(`http://localhost:3000/api/laporan/${id}`, { cache: 'no-store' });
  
  if (!res.ok) return <div>Laporan tidak ditemukan</div>;
  const laporan = await res.json();

  const isi = String(laporan.isi_laporan || '');
  const imgMatch = isi.match(/(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp))/i);
  const gambar = imgMatch ? imgMatch[0] : null;
  const text = isi.replace(/(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp))/gi, '').trim();

  return (
    <div style={{ padding: '30px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
        <a href="/app" style={{ fontSize: '32px', color: '#666', textDecoration: 'none' }}>Back</a>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, flex: 1 }}>
          {text.split('\n')[0]}
        </h1>
        <button style={{
          background: '#666',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '50px',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}>
          Terima Laporan
        </button>
      </div>

      <div style={{
        background: '#f9f9f9',
        padding: '24px',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: '#ddd',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          fontWeight: 'bold'
        }}>
          {laporan.nama_pelapor?.[0] || 'A'}
        </div>
        <div>
          <strong style={{ fontSize: '20px' }}>{laporan.nama_pelapor || 'Anonim'}</strong><br/>
          <span style={{ color: '#666' }}>{laporan.email || '-'}</span>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right', color: '#666' }}>
          Sabtu, 25 Oktober 2025<br/>
          <strong>1 menit lalu</strong>
        </div>
      </div>

      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        marginBottom: '30px',
        lineHeight: '1.8',
        fontSize: '17px'
      }}>
        {text}
      </div>

      {gambar && (
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <img src={gambar} alt="Bukti" style={{ maxWidth: '100%', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }} />
        </div>
      )}

      <div style={{ textAlign: 'right' }}>
        <button style={{
          background: '#d32f2f',
          color: 'white',
          border: 'none',
          padding: '16px 40px',
          borderRadius: '50px',
          fontSize: '18px',
          fontWeight: 'bold',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          Location
        </button>
      </div>
    </div>
  );
}