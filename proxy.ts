import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'cookie';
import { checkServerSession } from './lib/api/serverApi';

const privateRoutes = ['/profile', '/notes'];
const publicRoutes = ['/sign-in', '/sign-up'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  const isPrivateRoute = privateRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  if (accessToken) {
    if (isPublicRoute) {
      return NextResponse.redirect(new URL('/profile', request.url));
    }

    return NextResponse.next();
  }

  if (!refreshToken) {
    if (isPrivateRoute) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    return NextResponse.next();
  }

  try {
    const data = await checkServerSession();
    const setCookie = data.headers['set-cookie'];

    if (setCookie) {
      const cookieArray = Array.isArray(setCookie) ? setCookie : [setCookie];

      const renewedCookies: {
        name: string;
        value: string;
        path: string;
        expires?: Date;
        maxAge?: number;
      }[] = [];

      for (const cookieStr of cookieArray) {
        const parsed = parse(cookieStr);

        for (const name of ['accessToken', 'refreshToken']) {
          const value = parsed[name];

          if (value) {
            const expires = parsed.Expires ? new Date(parsed.Expires) : undefined;

            const maxAge = parsed['Max-Age'] ? Number(parsed['Max-Age']) : undefined;

            renewedCookies.push({
              name,
              value,
              path: parsed.Path || '/',
              expires: expires && !isNaN(expires.getTime()) ? expires : undefined,
              maxAge: maxAge !== undefined && Number.isFinite(maxAge) ? maxAge : undefined,
            });
          }
        }
      }

      const hasNewAccessToken = renewedCookies.some((cookie) => cookie.name === 'accessToken');

      if (hasNewAccessToken) {
        for (const cookie of renewedCookies) {
          request.cookies.set(cookie.name, cookie.value);
        }

        const response = isPublicRoute
          ? NextResponse.redirect(new URL('/profile', request.url))
          : NextResponse.next({
              request: {
                headers: new Headers(request.headers),
              },
            });

        for (const cookie of renewedCookies) {
          response.cookies.set({
            ...cookie,
            httpOnly: true,
            secure: request.nextUrl.protocol === 'https:',
            sameSite: 'lax',
          });
        }

        return response;
      }
    }
  } catch {}

  if (isPrivateRoute) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/profile/:path*', '/notes/:path*', '/sign-in', '/sign-up'],
};
