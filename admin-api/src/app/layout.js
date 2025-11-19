export const metadata = {
  title: 'Admin API - Aplikasi Pelaporan Insiden',
  description: 'Sistem admin untuk aplikasi pelaporan insiden',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body style={{ height: '100vh', overflow: 'hidden' }}>{children}</body>
    </html>
  )
}
