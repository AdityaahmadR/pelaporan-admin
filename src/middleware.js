import { NextResponse } from 'next/server';

export function middleware(request) {
  // 1. Ambil token dari Cookies
  const token = request.cookies.get('token')?.value;
  
  // 2. Ambil URL yang sedang dibuka
  const { pathname } = request.nextUrl;

  // SKENARIO 1: User BELUM Login tapi memaksa masuk ke /app
  if (pathname.startsWith('/app')) {
    if (!token) {
      // Tendang balik ke halaman Login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // SKENARIO 2: User SUDAH Login tapi iseng buka /login lagi
  if (pathname.startsWith('/login')) {
    if (token) {
      // Lempar langsung ke Dashboard
      return NextResponse.redirect(new URL('/app', request.url));
    }
  }

  // Jika aman, lanjut request
  return NextResponse.next();
}

// Konfigurasi halaman mana saja yang dijaga
export const config = {
  matcher: ['/app/:path*', '/login'],
};