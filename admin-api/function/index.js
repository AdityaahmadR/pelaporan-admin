// Import library yang diperlukan
const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Inisialisasi Firebase Admin di dalam fungsi
admin.initializeApp();

// Buat fungsi baru yang akan terpicu setiap kali ada data baru
// di path 'fire_detection_system/system/danger_status'
exports.onDangerStatusChange = functions.region("asia-southeast1") // Sesuaikan dengan region database Anda
  .database.ref("/fire_detection_system/system/danger_status")
  .onWrite(async (change, context) => {

    // Ambil nilai status yang baru
    const newStatus = change.after.val();

    console.log(`Status bahaya berubah menjadi: ${newStatus}`);

    // Jika nilai sebelumnya sudah DANGER, jangan kirim notifikasi lagi untuk menghindari spam.
    // Fungsi hanya akan berjalan jika status berubah DARI SESUATU -> KE DANGER.
    if (change.before.val() === "DANGER" && newStatus === "DANGER") {
        console.log("Status masih DANGER, tidak ada notifikasi baru yang dikirim.");
        return null;
    }

    // PERIKSA JIKA STATUS BARU ADALAH 'DANGER'
    if (newStatus === "DANGER") {
      console.log("Status DANGER terdeteksi, bersiap mengirim notifikasi.");

      // Siapkan pesan notifikasi
      const topic = "laporan_darurat"; // Topik yang sama dengan yang di-subscribe aplikasi petugas
      const message = {
        data: {
          title: "🔥 PERINGATAN SENSOR!",
          body: "Sistem IoT mendeteksi adanya potensi bahaya kebakaran!",
          // Kita tidak punya link lokasi dari IoT, jadi bisa dikosongkan atau diisi lokasi gedung
          googleMapsLink: "", 
          // Tipe 'darurat' untuk memicu layar merah
          notificationType: "darurat",
        },
        topic: topic,
        android: {
          priority: "high",
        },
      };

      try {
        // Kirim pesan notifikasi menggunakan Firebase Admin SDK
        const response = await admin.messaging().send(message);
        console.log("Notifikasi IoT berhasil dikirim:", response);
      } catch (error) {
        console.error("Gagal mengirim notifikasi IoT:", error);
      }
    } else {
      console.log("Status aman, tidak ada notifikasi yang dikirim.");
    }
    
    return null;
  });