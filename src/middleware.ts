/* eslint-disable no-console */

import { NextRequest, NextResponse } from 'next/server';

import { getAuthInfoFromCookie } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 登录页直接放行，防止登录重定向死循环
  if (pathname === '/login' || pathname.startsWith('/login/')) {
    return NextResponse.next();
  }

  // 跳过不需要认证的路径
  if (shouldSkipAuth(pathname)) {
    return NextResponse.next();
  }

  const storageType =
    process.env.NEXT_PUBLIC_STORAGE_TYPE || 'localstorage';

  // 没有设置密码时跳转到警告页面
  if (!process.env.PASSWORD) {
    const warningUrl = new URL('/warning', request.url);
    return NextResponse.redirect(warningUrl);
  }

  // 获取认证信息
  const authInfo = getAuthInfoFromCookie(request);

  if (!authInfo) {
    return handleAuthFailure(request, pathname);
  }

  // localstorage 模式
  if (storageType === 'localstorage') {
    if (
      !authInfo.password ||
      authInfo.password !== process.env.PASSWORD
    ) {
      return handleAuthFailure(request, pathname);
    }

    return NextResponse.next();
  }

  // Redis / Upstash / Kvrocks 模式
  if (!authInfo.username || !authInfo.signature) {
    return handleAuthFailure(request, pathname);
  }

  const isValidSignature = await verifySignature(
    authInfo.username,
    authInfo.signature,
    process.env.PASSWORD
  );

  if (isValidSignature) {
    return NextResponse.next();
  }

  return handleAuthFailure(request, pathname);
}

// 验证 HMAC-SHA256 签名
async function verifySignature(
  data: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const encoder = new TextEncoder();

  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(data);

  try {
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      {
        name: 'HMAC',
        hash: 'SHA-256',
      },
      false,
      ['verify']
    );

    const signatureBytes =
      signature
        .match(/.{1,2}/g)
        ?.map((byte) => parseInt(byte, 16)) || [];

    const signatureBuffer = new Uint8Array(signatureBytes);

    return await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBuffer,
      messageData
    );
  } catch (error) {
    console.error('签名验证失败:', error);
    return false;
  }
}

// 认证失败处理
function handleAuthFailure(
  request: NextRequest,
  pathname: string
): NextResponse {
  // API 请求返回 401
  if (pathname.startsWith('/api')) {
    return new NextResponse('Unauthorized', {
      status: 401,
    });
  }

  // 普通页面跳转到登录页
  const loginUrl = new URL('/login', request.url);

  const fullUrl = `${pathname}${request.nextUrl.search}`;

  loginUrl.searchParams.set('redirect', fullUrl);

  return NextResponse.redirect(loginUrl);
}

// 判断是否跳过认证
function shouldSkipAuth(pathname: string): boolean {
  const skipPaths = [
    '/_next',
    '/favicon.ico',
    '/robots.txt',
    '/manifest.json',
    '/icons/',
    '/logo.png',
    '/screenshot.png',
  ];

  return skipPaths.some((path) => pathname.startsWith(path));
}

// middleware 匹配规则
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|login|warning|api/login|api/register|api/logout|api/cron|api/server-config).*)',
  ],
};
