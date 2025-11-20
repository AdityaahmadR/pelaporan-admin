// src/app/pengguna/page.js
import styles from '../pengguna/pengguna.module.css';
import Sidebar from '../../components/Sidebar';
import Image from 'next/image';
import { headers } from 'next/headers'; // INI YANG BIKIN VERCEL TAKUT PRERENDER!

// INI PALING PENTING — BIKIN HALAMAN INI 100% SERVER-SIDE & DYNAMIC!
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// PAKSA VERCEL JANGAN PRERENDER DENGAN headers()
export async function generateMetadata() {
  headers(); // CUKUP 1 BARIS INI → VERCEL LANGSUNG SKIP PRERENDER!
  return { title: 'Database Pengguna' };
}

export default async function DatabasePengguna() {
  // LANGSUNG AMBIL DATA DI SERVER (TANPA CLIENT FETCH!)
  const res = await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/pengguna?role=masyarakat`, {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-store'
    }
  });
  const users = await res.json();

  return (
    <div className={styles.page}>
      <Sidebar isOpen={true} setIsOpen={() => {}} activePage="/pengguna" />

      <div className={styles.topBar}>
        <div className={styles.searchWrapper}>
          <div className={styles.searchBar}>
            <Image src="/Search.png" alt="Search" width={20} height={20} className={styles.searchIcon} />
            <input type="text" placeholder="Search" className={styles.searchInput} />
          </div>
        </div>
        <button className={styles.uploadButton}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span>Upload</span>
        </button>
      </div>

      <main className={styles.content}>
        <header className={styles.header} style={{ paddingBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '40px', position: 'relative', paddingLeft: '12px' }}>
            <h2 style={{ margin: 0, fontSize: '26px', fontWeight: 800, color: '#212529', position: 'relative' }}>
              Database Masyarakat
              <span style={{ position: 'absolute', left: 0, right: 0, bottom: '-10px', height: '4px', background: '#d71c1c', borderRadius: '2px' }}></span>
            </h2>
            <h2 style={{ margin: 0, fontSize: '26px', fontWeight: 700, color: '#212529', opacity: 0.6 }}>
              Database Petugas
            </h2>
          </div>
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '1px', background: '#e5e7eb' }}></div>
        </header>

        <div style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Nama</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Email</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Riwayat Pelaporan</th>
                <th style={{ padding: '16px' }}></th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>Tidak ada data masyarakat</td></tr>
              ) : (
                users.map(user => (
                  <tr key={user.userID} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '16px', fontWeight: 600 }}>{user.nama}</td>
                    <td style={{ padding: '16px', color: '#666' }}>{user.email}</td>
                    <td style={{ padding: '16px', color: '#666' }}>{user.jumlah_laporan || 0} Pelaporan</td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <form action={`/api/pengguna/${user.userID}`} method="DELETE">
                        <button type="submit" style={{
                          background: '#ef4444', color: 'white', border: 'none', padding: '8px 20px',
                          borderRadius: '50px', fontSize: '14px', fontWeight: 600, cursor: 'pointer'
                        }}>
                          Hapus
                        </button>
                      </form>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <button style={{
          position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)',
          background: 'transparent', border: 'none', fontSize: '18px', fontWeight: 600, color: '#666',
          display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', zIndex: 100
        }}>
          <div style={{
            width: '56px', height: '56px', background: '#e5e7eb', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', color: '#666', fontWeight: '300'
          }}>+</div>
          Tambah User
        </button>
      </main>
    </div>
  );
}