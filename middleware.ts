import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { hasAdminSession } from '@/lib/adminSessionStore';

const ADMIN_PATHS = ['/admin', '/admin/'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoot = ADMIN_PATHS.includes(pathname);
  const isAdminSubPath =
    pathname.startsWith('/admin/') && !pathname.startsWith('/admin/login');

  if (!isAdminRoot && !isAdminSubPath) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get('admin_session')?.value;

  if (!sessionCookie || !hasAdminSession(sessionCookie)) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};




