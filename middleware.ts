import { NextRequest } from 'next/server';
import { proxy } from './proxy';

export function middleware(request: NextRequest) {
  return proxy(request);
}

export const config = {
  matcher: ['/profile/:path*', '/notes/:path*', '/sign-in', '/sign-up'],
};
