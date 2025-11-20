// pages/pengguna.js
import Head from 'next/head';

// PAKAI STYLE LANGSUNG DI JSX — NGGAK PERLU IMPORT CSS MODULE LAGI!
// Sidebar juga kita hardcode dulu biar nggak error import

export async function getServerSideProps() {
  return { props: {} }; // Ini yang bikin Vercel 100% SSR → tidak prerender
}

export default function PenggunaPage() {
  return (
    <>
      <Head>
        <title>Database Pengguna | Admin Panel</title>
      </Head>

      <div style={{ minHeight: '100vh', background: '#f3f4f6', fontFamily: 'system-ui, sans-serif' }}>
        {/* SIDEBAR HARD CODE DULU */}
        <div style={{
          position: 'fixed', left: 0, top: 0, bottom: 0, width: '280px', background: '#1f2937',
          padding: '24px', color: 'white', boxShadow: '4px 0 20px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '40px' }}>Admin Panel</h1>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ padding: '12px 16px', background: '#374151', borderRadius: '8px', marginBottom: '8px' }}>
              Database Pengguna
            </li>
            <li style={{ padding: '12px 16px', opacity: 0.7 }}>Laporan</li>
            <li style={{ padding: '12px 16px', opacity: 0.7 }}>Darurat</li>
          </ul>
        </div>

        {/* MAIN CONTENT */}
        <div style={{ marginLeft: '280px', padding: '32px' }}>
          {/* TOP BAR */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div style={{ flex: 1, maxWidth: '400px' }}>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Search"
                  style={{
                    width: '100%', padding: '12px 16px 12px 44px', borderRadius: '12px',
                    border: '1px solid #d1d5db', fontSize: '16px'
                  }}
                />
                <span style={{ position: 'absolute', left: '16px', top: '14px', color: '#9ca3af' }}>Search</span>
              </div>
            </div>
            <button style={{
              background: '#111827', color: 'white', padding: '12px 24px', borderRadius: '12px',
              display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Upload
            </button>
          </div>

          {/* HEADER TAB */}
          <div style={{ marginBottom: '32px', position: 'relative' }}>
            <div style={{ display: 'flex', gap: '40px', paddingLeft: '12px' }}>
              <h2 style={{ margin: 0, fontSize: '26px', fontWeight: 800, color: '#212529', position: 'relative' }}>
                Database Masyarakat
                <span style={{ position: 'absolute', left: 0, right: 0, bottom: '-10px', height: '4px', background: '#d71c1c', borderRadius: '2px' }}></span>
              </h2>
              <h2 style={{ margin: 0, fontSize: '26px', fontWeight: 700, color: '#212529', opacity: 0.6 }}>
                Database Petugas
              </h2>
            </div>
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '1px', background: '#e5e7eb' }}></div>
          </div>

          {/* SUCCESS MESSAGE */}
          <div style={{
            background: '#fff', borderRadius: '16px', padding: '60px 40px', textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)', maxWidth: '800px', margin: '0 auto'
          }}>
            <div style={{ fontSize: '80px', marginBottom: '20px' }}>Checkmark</div>
            <h1 style={{ fontSize: '42px', color: '#10b981', marginBottom: '16px', fontWeight: 'bold' }}>
              BUILD HIJAU!
            </h1>
            <p style={{ fontSize: '22px', color: '#374151', marginBottom: '24px' }}>
              Selamat bro! Timeout sudah mati selamanya.
            </p>
            <p style={{ color: '#6b7280', lineHeight: '1.8', fontSize: '18px' }}>
              Halaman /pengguna sudah pindah ke <code style={{ background: '#f3f4f6', padding: '4px 8px', borderRadius: '6px' }}>pages/pengguna.js</code><br />
              Vercel tidak akan prerender lagi → <strong>deploy selalu hijau</strong><br /><br />
              Besok kita lanjut:<br />
              → Ambil data dari Railway MySQL<br />
              → Bikin tabel + hapus user<br />
              → Tambah user baru
            </p>
          </div>

          {/* TOMBOL TAMBAH USER */}
          <button style={{
            position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)',
            background: 'transparent', border: 'none', fontSize: '18px', fontWeight: 600, color: '#666',
            display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', zIndex: 100
          }}>
            <div style={{
              width: '56px', height: '56px', background: '#e5e7eb', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', color: '#666'
            }}>+</div>
            Tambah User
          </button>
        </div>
      </div>
    </>
  );
}