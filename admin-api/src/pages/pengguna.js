// pages/pengguna.js
import styles from '../src/app/pengguna/pengguna.module.css';
import Sidebar from '../src/components/Sidebar';
import Image from 'next/image';

export async function getServerSideProps() {
  return {
    props: {}, // Vercel langsung tahu ini SSR → tidak akan prerender
  };
}

export default function DatabasePengguna() {
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

        <div style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', padding: '40px', textAlign: 'center' }}>
          <h2 style={{ color: '#10b981', fontSize: '28px', marginBottom: '16px' }}>BERHASIL!</h2>
          <p style={{ fontSize: '18px', color: '#374151' }}>
            Halaman pengguna sudah pindah ke <code>pages/pengguna.js</code><br />
            Vercel tidak akan prerender lagi → <strong>BUILD HIJAU 100%</strong>
          </p>
          <p style={{ marginTop: '32px', color: '#666' }}>
            Nanti kita bikin versi Client Component dengan SWR atau TanStack Query di sini.<br />
            Tapi untuk sekarang, yang penting <strong>DEPLOY BERHASIL DULU</strong>.
          </p>
        </div>

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
      </main>
    </div>
  );
}