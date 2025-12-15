/** @type {import('next').NextConfig} */
const nextConfig = {
  // Aktifkan App Directory (wajib untuk Next.js dengan folder app/)
  experimental: {
    appDir: true,
  },

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