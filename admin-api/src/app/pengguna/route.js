// src/app/api/pengguna/route.js
import { getAuth } from 'firebase-admin/auth';
import { adminApp } from '@/lib/firebaseAdmin'; // pastikan file ini sudah ada & benar

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase() || '';

    const { users } = await getAuth(adminApp).listUsers();

    let filtered = users.map(user => ({
      uid: user.uid,
      nama: user.displayName || 'Tanpa Nama',
      email: user.email || '-',
      foto: user.photoURL || '/logo_kecil.png',
      dibuat: new Date(user.metadata.creationTime).toLocaleDateString('id-ID'),
      terakhirLogin: user.metadata.lastSignInTime
        ? new Date(user.metadata.lastSignInTime).toLocaleString('id-ID')
        : 'Belum pernah',
      status: user.disabled ? 'Nonaktif' : 'Aktif',
    }));

    if (search) {
      filtered = filtered.filter(u =>
        u.nama.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search)
      );
    }

    return Response.json({ users: filtered });
  } catch (error) {
    console.error('Error list users:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}