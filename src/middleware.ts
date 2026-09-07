/* eslint-disable no-console */

import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 登录页绝对放行
  if (pathname === '/login' || pathname.startsWith('/login/')) {
    return NextResponse.next();
  }

  // API 登录接口绝对放行
  if (
    pathname === '/api/login' ||
    pathname === '/api/logout' ||
    pathname === '/api/register' ||
    pathname === '/api/server-config'
  ) {
    return NextResponse.next();
  }

  // 其他请求暂时全部放行
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
