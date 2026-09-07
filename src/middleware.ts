/* eslint-disable no-console */

import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 登录页面绝对放行
  if (pathname === '/login' || pathname.startsWith('/login/')) {
    return NextResponse.next();
  }

  // 登录相关 API 绝对放行
  if (
    pathname === '/api/login' ||
    pathname === '/api/logout' ||
    pathname === '/api/register'
  ) {
    return NextResponse.next();
  }

  // 静态资源放行
  if (
    pathname.startsWith('/_next/') ||
    pathname === '/favicon.ico' ||
    pathname === '/manifest.json' ||
    pathname.startsWith('/icons/')
  ) {
    return NextResponse.next();
  }

  // 检查认证 Cookie
  const authCookie = request.cookies.get('auth')?.value;

  // 没有 Cookie → 登录页
  if (!authCookie) {
    const loginUrl = new URL('/login', request.url);

    const redirect = `${pathname}${request.nextUrl.search}`;

    loginUrl.searchParams.set('redirect', redirect);

    return NextResponse.redirect(loginUrl);
  }

  // 有 Cookie → 正常访问
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
