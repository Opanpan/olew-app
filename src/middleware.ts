import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['en', 'id'];
const defaultLocale = 'en';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip if pathname already has locale or is a special path
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    locales.some(locale => pathname.startsWith(`/${locale}`))
  ) {
    return NextResponse.next();
  }

  // Redirect to default locale
  return NextResponse.redirect(new URL(`/${defaultLocale}${pathname}`, request.url));
}

export const config = {
  // `relay` is the Sentry tunnel (`tunnelRoute` in next.config.js). Middleware
  // runs before rewrites, so without this it would be redirected to
  // `/en/relay` and every browser error report would 404.
  matcher: ['/((?!_next|api|relay|favicon.ico).*)'],
};
