import { NextRequest, NextResponse } from 'next/server';
import { parseSetCookie } from 'cookie';
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
      return NextResponse.redirect(new URL('/', request.url));
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

      const parsedCookies = cookieArray.map((cookieStr) => parseSetCookie(cookieStr));

      const hasNewAccessToken = parsedCookies.some(
        (cookie) => cookie.name === 'accessToken' && !!cookie.value
      );

      if (hasNewAccessToken) {
        const requestHeaders = new Headers(request.headers);

        const cookieValues = new Map(
          request.cookies.getAll().map(({ name, value }) => [name, value])
        );

        for (const cookie of parsedCookies) {
          if (cookie.value === undefined) continue;

          cookieValues.set(cookie.name, cookie.value);
        }
        requestHeaders.set(
          'cookie',
          Array.from(cookieValues)
            .map(([name, value]) => `${name}=${encodeURIComponent(value)}`)
            .join('; ')
        );

        const response = isPublicRoute
          ? NextResponse.redirect(new URL('/', request.url))
          : NextResponse.next({
              request: {
                headers: requestHeaders,
              },
            });

        for (const cookie of parsedCookies) {
          if (cookie.value === undefined) continue;

          response.cookies.set({
            ...cookie,
            value: cookie.value,
          });
        }

        return response;
      }
    }
  } catch {
    console.error('Session refresh failed');
  }

  if (isPrivateRoute) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/profile/:path*', '/notes/:path*', '/sign-in', '/sign-up'],
};
