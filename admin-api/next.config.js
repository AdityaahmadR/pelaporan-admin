/** @type {import('next').NextConfig} */
const nextConfig = {
  // Bagian experimental appDir dihapus karena sudah default di versi terbaru
  
  // Konfigurasi Webpack (Penting untuk kompatibilitas mysql2)
  webpack: (config) => {
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    };
    return config;
  },
};

export default nextConfig;