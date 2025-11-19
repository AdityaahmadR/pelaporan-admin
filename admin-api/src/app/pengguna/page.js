"use client";

// BARIS INI YANG BIKIN SEMUA BERUBAH — WAJIB ADA!!
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import styles from './pengguna.module.css';
import Sidebar from '@/components/Sidebar';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function DatabasePengguna() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/pengguna')
      .then(r => r.json())
      .then(data => setUsers(data.users || []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u => 
    u.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`${styles.page} ${!sidebarOpen ? styles.sidebarCollapsed : ''}`}>
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} activePage="/pengguna" />

      <div className={styles.topBar}>
        <div className={styles.searchWrapper}>
          <div className={styles.searchBar}>
            <Image src="/Search.png" alt="Search" width={20} height={20} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Cari nama atau email pengguna..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <button className={styles.uploadButton}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14m-7-7h14" />
          </svg>
          <span>Tambah Pengguna</span>
        </button>
      </div>

      <main className={`${styles.content} ${!sidebarOpen ? styles.collapsed : ''}`}>
        <header className={styles.header}>
          <h2>Database Pengguna</h2>
        </header>

        {loading ? (
          <div className={styles.emptyState}><p>Memuat data...</p></div>
        ) : filtered.length === 0 ? (
          <div className={styles.emptyState}><p>Belum ada pengguna</p></div>
        ) : (
          <div className={styles.userGrid}>
            {filtered.map(user => (
              <div key={user.uid} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <div className="flex items-center gap-4 mb-4">
                  <img src={user.foto || '/logo_kecil.png'} alt="" className="w-16 h-16 rounded-full object-cover" />
                  <div>
                    <h3 className="font-bold text-lg">{user.nama}</h3>
                    <p className="text-gray-600 text-sm">{user.email}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-600 space-y-1 mb-4">
                  <p><strong>Dibuat:</strong> {user.dibuat}</p>
                  <p><strong>Login terakhir:</strong> {user.terakhirLogin}</p>
                  <p><strong>Status:</strong> <span className={user.status === 'Aktif' ? 'text-green-600' : 'text-red-600'}>{user.status}</span></p>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 rounded-xl">Edit</button>
                  <button className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl">Hapus</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}