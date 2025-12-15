/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 16 - App Directory sudah stable, tapi tetap perlu untuk lokal
  experimental: {
    appDir: true,
  },

  // Konfigurasi Webpack (untuk kompatibilitas mysql2)
  webpack: (config) => {
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    };
    return config;
  },
};

export default nextConfig;