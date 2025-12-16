import admin from 'firebase-admin';

// Cek jika sudah diinisialisasi (Singleton Pattern)
if (!admin.apps.length) {
  try {
    // KITA UBAH DISINI: Menggunakan 1 Variable JSON utuh
    // Ini lebih aman daripada memecah variable (Project ID, Client Email, Private Key)
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (serviceAccountKey) {
      // Parse string JSON menjadi Object
      const serviceAccount = JSON.parse(serviceAccountKey);

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      
      console.log('✅ Firebase Admin SDK berhasil diinisialisasi.');
    } else {
      console.warn('⚠️ FIREBASE_SERVICE_ACCOUNT_KEY tidak ditemukan di Environment Variables.');
    }
  } catch (error) {
    console.error('❌ Error fatal inisialisasi Firebase Admin:', error.message);
    // Kita tidak throw error agar aplikasi tidak crash total, 
    // tapi fitur notifikasi tidak akan jalan.
  }
}

export { admin };