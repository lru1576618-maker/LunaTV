import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 登录页直接放行
  if (pathname === '/login' || pathname.startsWith('/login/')) {
    return NextResponse.next();
  }

  // 登录 API 直接放行
  if (
    pathname === '/api/login' ||
    pathname === '/api/logout' ||
    pathname === '/api/register'
  ) {
    return NextResponse.next();
  }

  // 静态资源直接放行
  if (
    pathname.startsWith('/_next/') ||
    pathname === '/favicon.ico' ||
    pathname === '/manifest.json' ||
    pathname.startsWith('/icons/')
  ) {
    return NextResponse.next();
  }

  // 检查 auth Cookie
  const auth = request.cookies.get('auth')?.value;

  // 没有登录 → 登录页面
  if (!auth) {
    return NextResponse.redirect(
      new URL('/login', request.url)
    );
  }

  // 已登录 → 正常访问
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
