// pages/pengguna.js
import { useState, useEffect } from 'react';
import Head from 'next/head';

export const getServerSideProps = async () => {
  return { props: {} }; // cukup ini → Vercel jadi SSR, nggak timeout lagi
};

export default function Pengguna() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('masyarakat');

  useEffect(() => {
    fetch(`/api/pengguna?role=${activeTab}`)
      .then(r => r.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      });
  }, [activeTab]);

  const hapusUser = async (id) => {
    if (!confirm('Yakin hapus user ini?')) return;
    await fetch(`/api/pengguna/${id}`, { method: 'DELETE' });
    setUsers(users.filter(u => u.userID !== id));
  };

  return (
    <>
      <Head><title>Database Pengguna</title></Head>

      <div style={{ display: 'flex', minHeight: '100vh', background: '#f9fafb' }}>
        {/* Sidebar sederhana */}
        <div style={{ width: '280px', background: '#1f2937', color: 'white', padding: '24px' }}>
          <h2 style={{ fontWeight: 'bold', marginBottom: '40px' }}>Admin Panel</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ padding: '12px', background: '#374151', borderRadius: '8px' }}>Database Pengguna</li>
            <li style={{ padding: '12px', opacity: 0.6 }}>Laporan</li>
            <li style={{ padding: '12px', opacity: 0.6 }}>Darurat</li>
          </ul>
        </div>

        <div style={{ flex: 1, padding: '32px' }}>
          {/* Top bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
            <div style={{ position: 'relative', width: '400px' }}>
              <input type="text" placeholder="Search" style={{ width: '100%', padding: '12px 48px', borderRadius: '12px', border: '1px solid #ddd' }} />
              <span style={{ position: 'absolute', left: '16px', top: '14px', color: '#999' }}>Search</span>
            </div>
            <button style={{ background: '#111827', color: 'white', padding: '12px 24px', borderRadius: '12px' }}>Upload</button>
          </div>

          {/* Tab */}
          <div style={{ marginBottom: '32px', position: 'relative' }}>
            <div style={{ display: 'flex', gap: '40px', paddingLeft: '12px' }}>
              <h2 onClick={() => setActiveTab('masyarakat')} style={{ margin: 0, fontSize: '26px', fontWeight: activeTab === 'masyarakat' ? 800 : 700, cursor: 'pointer', position: 'relative' }}>
                Database Masyarakat
                {activeTab === 'masyarakat' && <span style={{ position: 'absolute', left: 0, right: 0, bottom: '-10px', height: '4px', background: '#d71c1c', borderRadius: '2px' }}></span>}
              </h2>
              <h2 onClick={() => setActiveTab('petugas')} style={{ margin: 0, fontSize: '26px', fontWeight: activeTab === 'petugas' ? 800 : 700, cursor: 'pointer', position: 'relative' }}>
                Database Petugas
                {activeTab === 'petugas' && <span style={{ position: 'absolute', left: 0, right: 0, bottom: '-10px', height: '4px', background: '#d71c1c', borderRadius: '2px' }}></span>}
              </h2>
            </div>
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '1px', background: '#e5e7eb' }}></div>
          </div>

          {/* Tabel — persis seperti gambar */}
          <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f9fafb' }}>
                <tr>
                  <th style={{ padding: '16px', textAlign: 'left' }}>Nama</th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>Email</th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>Riwayat Pelaporan</th>
                  <th style={{ padding: '16px' }}></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', padding: '40px' }}>Loading...</td></tr>
                ) : users.map(user => (
                  <tr key={user.userID} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '16px', fontWeight: 600 }}>{user.nama}</td>
                    <td style={{ padding: '16px', color: '#666' }}>{user.email}</td>
                    <td style={{ padding: '16px', color: '#666' }}>{user.jumlah_laporan || 0} Pelaporan</td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <button onClick={() => hapusUser(user.userID)} style={{
                        background: '#ef4444', color: 'white', border: 'none', padding: '8px 20px',
                        borderRadius: '50px', fontSize: '14px', fontWeight: 600, cursor: 'pointer'
                      }}>
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tombol Tambah User */}
          <button style={{
            position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)',
            background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '12px',
            fontSize: '18px', fontWeight: 600, color: '#666', cursor: 'pointer'
          }}>
            <div style={{ width: '56px', height: '56px', background: '#e5e7eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>+</div>
            Tambah User
          </button>
        </div>
      </div>
    </>
  );
}