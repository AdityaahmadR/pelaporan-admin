/** @type {import('next').NextConfig} */
const nextConfig = {
  // TAMBAHKAN BARIS INI (Wajib di Next.js 16 jika pakai Webpack custom)
  turbopack: {},

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