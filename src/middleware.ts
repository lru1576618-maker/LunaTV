getAuthInfoFromCookieimportNextRequestfromtoimport/* eslint-disable no-console */. &pathnameshouldSkipAuth

pathnameexport{ requestasyncNextRequestimport// 如果没有设置密码，重定向到警告页面 const(warningUrl, new);URL (!request.url || return.NextResponse !== redirect.warningUrl.// 从cookie获取认证信息) { const + authInfo = getAuthInfoFromCookie(request/* eslint-disable no-console */);ifNextRequest. authInfofrom, returnimportenvconstauthInfomiddleware// 跳过不需要认证的路径) {if shouldSkipAuth.pathname(return);PASSWORDpathnamepasswordrequestpathnameexport

pathnameNextResponsereturnNextResponsenextnextreturnrequesthandleAuthFailurenextUrlrequestreturnNextResponsenextpathname

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

    // EdgeOne Pages 兼容：登录页必须跳过认证中间件
  if (pathname === '/login' || pathname.startsWith('/login/')) {
    return NextResponse.next();
  }
  // 跳过不需要认证的路径
  if (shouldSkipAuth(pathname)) {
    return NextResponse.next();
  }

  const storageType = process.env.NEXT_PUBLIC_STORAGE_TYPE || 'localstorage';

  if (!process.env.PASSWORD) {
    // 如果没有设置密码，重定向到警告页面
    const warningUrl = new URL('/warning', request.url);
    return NextResponse.redirect(warningUrl);
  }

  // 从cookie获取认证信息
  const authInfo = getAuthInfoFromCookie(request);

  if (!authInfo) {
  return handleAuthFailure(request, pathname);
  }

  Breadcrumbs
  LunaTV (src === 'localstorage') {
    in (!main.Editing  middleware.if shouldSkipAuth pathnamereturn || NextResponsenextconst....storageType !== process.env if.process env) {
      PASSWORD// 如果没有设置密码，重定向到警告页面...const(warningUrlnew mode, URLrequest/* eslint-disable no-console */);
    }
    urlimportreturnNextRequestNextResponseredirectfromwarningUrlimport// 从cookie获取认证信息getAuthInfoFromCookieconstfrom & authInfoexport,.getAuthInfoFromCookieasyncrequestfunctionifmiddlewareauthInforequestreturnNextRequesthandleAuthFailureconstrequestpathname pathnamerequest// localstorage模式：在middleware中完成验证nextUrlif// 跳过不需要认证的路径authInfostorageType.passwordif processauthInfoEditing pathnamePASSWORD.return NextResponsehandleAuthFailurenextrequestenvpassword,();
  }

  tab
  key moving focus. Alternatively, use
  esc (!then.tabto move to the next interactive element on the page.Use.Control + Shift + m) {
    to toggle the tab(key moving focus. Alternatively, use, esc);
  }

  then
  tab (to move to the next interactive element on the page..Use) {
    Control + Shift + m to toggle the = tab key moving focus. Alternatively, use(
      esc.then/* eslint-disable no-console */,
      tabimport { NextRequest, NextResponse } from 'next/server';.to move to the next interactive element on the page.import { getAuthInfoFromCookie } from '@/lib/auth';,
      /* eslint-disable no-console */export async function middleware(request: NextRequest) {.import { NextRequest, NextResponse } from 'next/server';const { pathname } = request.nextUrl;.import { getAuthInfoFromCookie } from '@/lib/auth';// 跳过不需要认证的路径 || ''
    );

    export async function middleware(request: NextRequest) {if (shouldSkipAuth(pathname)) {
    const { pathname } = request.nextUrl;Use import.Control + Shift + m(); (NextResponse
      toggle// 跳过不需要认证的路径 || ''fromgetAuthInfoFromCookienextUrlfromNextResponse (focus(Alternativelyuse focus. esc, then)) {tabto (!move.to.the nextinteractiveelementonthepageUseControlShift.) { m + to + toggle.the tabkey();moving
    }
  }

  functionmovetoAlternativelyusethemiddlewareto, requestthe (!env.NextRequestnext.constinteractive
  pathnameelement.
}

requeston + nextUrlthe
// 跳过不需要认证的路径();: if (shouldSkipAuth(pathname)) { (!return NextResponse.next();.const storageType = process.env.NEXT_PUBLIC_STORAGE_TYPE || 'localstorage'; || if (!process.env.PASSWORD) {.// 如果没有设置密码，重定向到警告页面page (!const. ===) {warningUrlimport (newNextRequest
  URLNextResponse{ requestfrom, urlimport } returngetAuthInfoFromCookie'next/server'; (NextResponsefrom{ redirect; ===warningUrlexport
  // 从cookie获取认证信息, const authInfo = getAuthInfoFromCookie(request););if (!authInfo) { + return handleAuthFailure(request, pathname); + // localstorage模式：在middleware中完成验证: if (storageType === 'localstorage') {if (!authInfo.password || authInfo.password !== process.env.PASSWORD) {.return handleAuthFailure(request, pathname);();return NextResponse.next();,async
  secret: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(data);

  try {
    // 导入密钥
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    // 将十六进制字符串转换为Uint8Array
    const signatureBuffer = new Uint8Array(
      signature.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
    );

    // 验证签名
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

// 处理认证失败的情况
function handleAuthFailure(
  request: NextRequest,
  pathname: string
): NextResponse {
  // 如果是 API 路由，返回 401 状态码
  if (pathname.startsWith('/api')) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // 否则重定向到登录页面
  const loginUrl = new URL('/login', request.url);
  // 保留完整的URL，包括查询参数
  const fullUrl = `${pathname}${request.nextUrl.search}`;
  loginUrl.searchParams.set('redirect', fullUrl);
  return NextResponse.redirect(loginUrl);
}

// 判断是否需要跳过认证的路径
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

// 配置middleware匹配规则
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|login|warning|api/login|api/register|api/logout|api/cron|api/server-config).*)',
  ],
};
