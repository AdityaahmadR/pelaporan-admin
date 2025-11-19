// admin-api/src/app/pengguna/page.js
import { listUsers } from 'firebase-admin/auth';
import AdminLayout from '../../components/AdminLayout';
import SearchBar from '../../components/SearchBar';

export const revalidate = 0; // selalu ambil data terbaru

export default async function HalamanPengguna({ searchParams }) {
  const search = searchParams?.search || '';

  let allUsers = [];
  try {
    const result = await listUsers();
    allUsers = result.users.map(user => ({
      uid: user.uid,
      nama: user.displayName || 'Tanpa Nama',
      email: user.email || 'Tidak ada email',
      foto: user.photoURL || '/logo_kecil.png',
      dibuat: new Date(user.metadata.creationTime).toLocaleDateString('id-ID'),
      terakhirLogin: user.metadata.lastSignInTime
        ? new Date(user.metadata.lastSignInTime).toLocaleString('id-ID')
        : 'Belum pernah login',
      status: user.disabled ? 'Nonaktif' : 'Aktif',
      disabled: user.disabled,
    }));
  } catch (err) {
    console.error('Error fetching users:', err);
  }

  // Filter berdasarkan search
  const users = allUsers.filter(user =>
    user.nama.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="min-h-screen bg-black p-6">
        {/* HEADER MERAH GLOW + BADGE HITAM — PERSIS GAMBAR KAMU */}
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
          {/* Glow effect di bawah header */}
          <div className="absolute inset-x-0 -bottom-6 h-12 bg-red-600 blur-3xl opacity-70"></div>
        </div>

        {/* SEARCH BAR */}
        <div className="max-w-2xl mx-auto mb-8">
          <SearchBar placeholder="Cari nama, email, atau UID pengguna..." />
        </div>

        {/* GRID CARD PENGGUNA */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7 max-w-7xl mx-auto">
          {users.length === 0 ? (
            <div className="col-span-full text-center py-24">
              <p className="text-3xl text-gray-600 font-bold">Belum ada pengguna ditemukan</p>
            </div>
          ) : (
            users.map((user) => (
              <div
                key={user.uid}
                className="group bg-gradient-to-b from-gray-900 to-black border-2 border-gray-800 rounded-3xl p-6 hover:border-red-600 transition-all duration-500 shadow-2xl hover:shadow-red-600/30"
              >
                <div className="flex items-center justify-between mb-5">
                  <img
                    src={user.foto}
                    alt={user.nama}
                    className="w-20 h-20 rounded-full object-cover ring-4 ring-red-600 group-hover:ring-red-400 transition-all"
                    onError={(e) => e.target.src = '/logo_kecil.png'}
                  />
                  <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${
                    user.status === 'Aktif' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'
                  }`}>
                    {user.status}
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-white mb-1 truncate">{user.nama}</h3>
                <p className="text-red-400 text-sm mb-4 truncate">{user.email}</p>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Dibuat</span>
                    <span className="text-gray-300 font-medium">{user.dibuat}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Login terakhir</span>
                    <span className="text-gray-300 font-medium">{user.terakhirLogin}</span>
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <button className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-3 rounded-2xl transition transform hover:scale-105">
                    Edit
                  </button>
                  <button className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-2xl transition transform hover:scale-105">
                    Hapus
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}