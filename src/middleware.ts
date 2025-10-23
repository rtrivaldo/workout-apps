import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('token')?.value;
  const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

  const authPaths = ['/login', '/register'];
  const isAuthPath = authPaths.some(path => pathname.startsWith(path));
  const isStaticAsset =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.');

  if (isStaticAsset) return NextResponse.next();

  if (isAuthPath && token) {
    try {
      await jwtVerify(token, secret);
      return NextResponse.redirect(new URL('/', req.url));
    } catch {
      return NextResponse.next();
    }
  }

  if (!isAuthPath && !token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (token) {
    try {
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch {
      console.error('Invalid JWT');
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return NextResponse.next();
}
