"use client";

import styles from './pengguna.module.css';
import Sidebar from '@/components/Sidebar';
import { useState } from 'react';
import Image from 'next/image';

// INI YANG BIKIN VERCEL BAHAGIA — HALAMAN JADI DYNAMIC + NO FETCH
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function DatabasePengguna() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // DUMMY DATA — NANTI KITA GANTI PAKAI API YANG BENAR
  const dummyUsers = [
    { uid: '1', nama: 'Aditya Ahmad', email: 'adit@gmail.com', dibuat: '15 Nov 2025', terakhirLogin: '20 Nov 2025', status: 'Aktif', foto: '/logo_kecil.png' },
    { uid: '2', nama: 'Budi Santoso', email: 'budi@gmail.com', dibuat: '10 Nov 2025', terakhirLogin: '19 Nov 2025', status: 'Aktif', foto: '/logo_kecil.png' },
    { uid: '3', nama: 'Siti Nurhaliza', email: 'siti@gmail.com', dibuat: '05 Nov 2025', terakhirLogin: '18 Nov 2025', status: 'Nonaktif', foto: '/logo_kecil.png' },
  ];

  const filtered = dummyUsers.filter(u => 
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

        {filtered.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Belum ada pengguna ditemukan</p>
          </div>
        ) : (
          <div className={styles.userGrid}>
            {filtered.map(user => (
              <div key={user.uid} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <div className="flex items-center gap-4 mb-4">
                  <img src={user.foto} alt="" className="w-16 h-16 rounded-full object-cover ring-4 ring-gray-200" />
                  <div>
                    <h3 className="font-bold text-lg">{user.nama}</h3>
                    <p className="text-gray-600 text-sm">{user.email}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-600 space-y-1 mb-4">
                  <p><strong>Dibuat:</strong> {user.dibuat}</p>
                  <p><strong>Login terakhir:</strong> {user.terakhirLogin}</p>
                  <p><strong>Status:</strong> 
                    <span className={user.status === 'Aktif' ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                      {user.status}
                    </span>
                  </p>
                </div>
                <div className="flex gap-3">
                  <button className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 rounded-xl transition">
                    Edit
                  </button>
                  <button className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition">
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}