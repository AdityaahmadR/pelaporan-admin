// Diasumsikan Anda sudah menginisialisasi firebase-admin
// const admin = require('firebase-admin');

// ... di dalam fungsi controller Anda, misalnya setelah menyimpan laporan ke MySQL
// const createLaporan = async (req, res) => {
    // ...logika Anda untuk menyimpan laporan ke database...

    // Ambil data laporan yang baru saja dibuat
    const { deskripsi, lokasi, prioritas } = laporanBaru; 

    // Periksa apakah prioritasnya 'darurat'
    if (prioritas === 'darurat') {
        // Tentukan topik yang akan dikirimi pesan. Semua aplikasi petugas harus
        // subscribe ke topik ini.
        const topic = 'laporan_darurat';

        // Buat payload notifikasi
        const message = {
            data: {
                // Data ini akan diterima oleh aplikasi Android
                title: 'Laporan Darurat!',
                body: deskripsi, // Deskripsi dari laporan
                googleMapsLink: lokasi // Link Google Maps dari database
            },
            topic: topic,
            // Atur prioritas tinggi untuk memastikan notifikasi segera sampai
            android: {
                priority: 'high'
            }
        };

        // Kirim pesan menggunakan Firebase Admin SDK
        try {
            const response = await admin.messaging().send(message);
            console.log('Successfully sent emergency message:', response);
        } catch (error) {
            console.log('Error sending emergency message:', error);
        }
    }

    // ... sisa logika controller Anda ...
// };