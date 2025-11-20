// src/app/pengguna/page.js  ← GANTI SEMUA DENGAN INI (SERVER COMPONENT)
import styles from './pengguna.module.css';
import Sidebar from '@/components/Sidebar';
import Image from 'next/image';
import { headers } from 'next/headers'; // TRIK INI YANG BIKIN VERCEL LANGSUNG SKIP PRERENDER

// 3 BARIS INI YANG BIKIN VERCEL TAKUT PRERENDER → PASTI SSR!
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export async function generateMetadata() {
  headers(); // cukup 1 baris ini → Vercel langsung jadi Server Component 100%
  return { title: 'Database Pengguna' };
}

async function getUsers(role = 'masyarakat') {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_VERCEL_URL ? 'https://' + process.env.NEXT_PUBLIC_VERCEL_URL : 'http://localhost:3000'}/api/pengguna?role=${role}`,
    { cache: 'no-store' }
  );
  return res.json();
}

export default async function PenggunaPage({ searchParams }) {
  const role = searchParams?.role || 'masyarakat';
  const users = await getUsers(role);

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
            <path d="M21 15v4a2 2 0 1-2 2H5a2 2 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span>Upload</span>
        </button>
      </div>

      <main className={styles.content}>
        <header className={styles.header} style={{ paddingBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '40px', position: 'relative', paddingLeft: '12px' }}>
            <a href="/pengguna?role=masyarakat" style={{ textDecoration: 'none', color: 'inherit' }}>
              <h2 style={{ margin: 0, fontSize: '26px', fontWeight: role === 'masyarakat' ? 800 : 700, position: 'relative' }}>
                Database Masyarakat
                {role === 'masyarakat' && <span style={{ position: 'absolute', left: 0, right: 0, bottom: '-10px', height: '4px', background: '#d71c1c', borderRadius: '2px' }}></span>}
              </h2>
            </a>
            <a href="/pengguna?role=petugas" style={{ textDecoration: 'none', color: 'inherit' }}>
              <h2 style={{ margin: 0, fontSize: '26px', fontWeight: role === 'petugas' ? 800 : 700, position: 'relative' }}>
                Database Petugas
                {role === 'petugas' && <span style={{ position: 'absolute', left: 0, right: 0, bottom: '-10px', height: '4px', background: '#d71c1c', borderRadius: '2px' }}></span>}
              </h2>
            </a>
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
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '60px', color: '#999' }}>Tidak ada data</td></tr>
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
      </main>
    </div>
  );
}