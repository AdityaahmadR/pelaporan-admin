import admin from 'firebase-admin';

// Cek jika sudah diinisialisasi agar tidak error saat hot-reload
if (!admin.apps.length) {
  try {
    // Cek apakah environment variables Firebase tersedia
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
      console.log('Firebase Admin SDK: Environment variables tidak lengkap, skipping initialization');
    } else {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // Ganti \\n dengan \n agar format private key benar
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        })
      });
      console.log('Firebase Admin SDK berhasil diinisialisasi');
    }
  } catch (error) {
    console.log('Error inisialisasi Firebase Admin SDK:', error.message);
  }
}

// Ekspor instance admin yang sudah siap pakai
export { admin };