// src/app/app/page.js
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function LaporanMasyarakat() {
  const [laporanList, setLaporanList] = useState([]);

  useEffect(() => {
    fetch('/api/laporan/ambilLaporan', { cache: 'no-store' })
      .then(r => r.json().catch(() => []))
      .then(data => setLaporanList(data || []));
  }, []);

  const getStatusStyle = (status) => {
    if (status === 'Selesai') return { bg: '#d4edda', color: '#155724' };
    if (status === 'Sedang Berlangsung') return { bg: '#d1ecf1', color: '#0c5460' };
    return { bg: '#fff3cd', color: '#856404' }; // Laporan Masuk
  };

  return (
    <div style={{ padding: '30px' }}>
      <h1 style={{
        fontSize: '28px',
        fontWeight: 'bold',
        marginBottom: '30px',
        paddingBottom: '10px',
        borderBottom: '4px solid #d32f2f',
        display: 'inline-block'
      }}>
        Laporan Masyarakat
      </h1>

      <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))' }}>
        {laporanList.map((laporan) => {
          const desc = String(laporan.isi_laporan || '');
          const imgMatch = desc.match(/(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp))/i);
          const img = imgMatch ? imgMatch[0] : null;
          const text = desc.replace(/(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp))/gi, '').trim();
          const title = text.split('\n')[0] || 'Laporan Masyarakat';

          const statusStyle = getStatusStyle(laporan.status || 'Laporan Masuk');

          return (
            <a
              key={laporan.laporanID}
              href={`/app/detail/${laporan.laporanID}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div style={{
                background: 'white',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                transition: '0.3s',
                cursor: 'pointer'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-8px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {img && (
                  <img src={img} alt="bukti" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                )}
                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>{title}</h3>
                    <span style={{
                      background: statusStyle.bg,
                      color: statusStyle.color,
                      padding: '6px 16px',
                      borderRadius: '50px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {laporan.status || 'Laporan Masuk'}
                    </span>
                  </div>
                  <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6', margin: '12px 0' }}>
                    {text.split('\n').slice(1).join(' ').slice(0, 120)}...
                  </p>
                  <small style={{ color: '#999' }}>
                    Oleh: {laporan.nama_pelapor || 'Anonim'}
                  </small>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}