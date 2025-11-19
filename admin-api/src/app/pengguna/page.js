// src/app/pengguna/page.js → GANTI TOTAL JADI INI
'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import SearchBar from '@/components/SearchBar';

export const dynamic = 'force-dynamic';   // CUKUP 1 KALI SAJA!!
export const revalidate = 0;              // Biar selalu ambil data terbaru

export default function HalamanPengguna() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async (search = '') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/pengguna?search=${search}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setUsers(data.users || []);
    } catch (err) {
      alert('Gagal ambil data: ' + err.message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <AdminLayout>
      <div className="min-h-screen bg-black p-6">
        {/* HEADER MERAH GLOW */}
        <div className="relative mb-10">
          <div className="bg-gradient-to-r from-red-800 via-red-600 to-red-500 h-28 rounded-3xl flex items-center justify-between px-10 shadow-2xl overflow-hidden">
            <div>
              <h1 className="text-5xl font-black text-white tracking-wider drop-shadow-2xl">
                DATABASE PENGGUNA
              </h1>
              <p className="text-red-100 text-lg mt-2">Kelola semua akun pengguna sistem</p>
            </div>
            <div className="bg-black px-8 py-5 rounded-l-3xl shadow-2xl border-l-4 border-red-600">
              <div className="text-red-500 text-5xl font-bold">{users.length}</div>
              <div className="text-gray-400 text-sm uppercase tracking-wider">Total Pengguna</div>
            </div>
          </div>
          <div className="absolute inset-x-0 -bottom-6 h-12 bg-red-600 blur-3xl opacity-70"></div>
        </div>

        <div className="max-w-2xl mx-auto mb-8">
          <SearchBar placeholder="Cari nama atau email..." onSearch={fetchUsers} />
        </div>

        {loading ? (
          <div className="text-center py-20 text-2xl text-gray-400">Loading data pengguna...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7 max-w-7xl mx-auto">
            {users.map((user) => (
              <div key={user.uid} className="group bg-gradient-to-b from-gray-900 to-black border-2 border-gray-800 rounded-3xl p-6 hover:border-red-600 transition-all duration-500 shadow-2xl hover:shadow-red-600/30">
                <div className="flex items-center justify-between mb-5">
                  <img src={user.foto || '/logo_kecil.png'} alt="" className="w-20 h-20 rounded-full object-cover ring-4 ring-red-600" />
                  <span className={`px-4 py-2 rounded-full text-xs font-bold ${user.status === 'Aktif' ? 'bg-green-600' : 'bg-gray-700'}`}>
                    {user.status}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{user.nama}</h3>
                <p className="text-red-400 text-sm mb-4">{user.email}</p>
                <div className="text-sm space-y-2 text-gray-400">
                  <p>Dibuat: <span className="text-gray-300">{user.dibuat}</span></p>
                  <p>Login terakhir: <span className="text-gray-300">{user.terakhirLogin}</span></p>
                </div>
                <div className="mt-8 flex gap-3">
                  <button className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-3 rounded-2xl">Edit</button>
                  <button className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-2xl">Hapus</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}