// src/app/api/pengguna/route.js
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin sekali saja
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const auth = getAuth();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase() || '';

    const { users } = await auth.listUsers();

    let filteredUsers = users.map(user => ({
      uid: user.uid,
      nama: user.displayName || 'Tanpa Nama',
      email: user.email || '-',
      foto: user.photoURL || '/logo_kecil.png',
      dibuat: new Date(user.metadata.creationTime).toLocaleDateString('id-ID'),
      terakhirLogin: user.metadata.lastSignInTime
        ? new Date(user.metadata.lastSignInTime).toLocaleDateString('id-ID')
        : 'Belum pernah',
      status: user.disabled ? 'Nonaktif' : 'Aktif',
    }));

    if (search) {
      filteredUsers = filteredUsers.filter(u =>
        u.nama.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search)
      );
    }

    return Response.json({ users: filteredUsers });
  } catch (error) {
    console.error('Error API pengguna:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}