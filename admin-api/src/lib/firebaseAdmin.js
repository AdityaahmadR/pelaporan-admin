// src/lib/firebaseAdmin.js
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Cek kalau sudah ada app, jangan initialize ulang
if (!getApps().length) {
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
    console.log('Firebase Admin berhasil di-initialize');
  } catch (error) {
    console.error('Gagal initialize Firebase Admin:', error.message);
  }
}

// Export auth biar bisa dipake di API route
export const auth = getAuth();