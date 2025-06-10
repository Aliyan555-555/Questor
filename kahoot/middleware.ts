import { NextRequest, NextResponse } from 'next/server'
import { Logout } from './src/redux/api'

const protectedRoutes = ['/reports', '/auth/profile', '/api/private', '/play']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('session')?.value

  console.log(`[${new Date().toISOString()}] ${request.method} ${pathname}`)
  console.warn('Session token:', token);

  const isProtected = protectedRoutes.some(route =>
    pathname === route || pathname.startsWith(`${route}/`)
  )

  if (isProtected) {
    if (!token) {
      const loginUrl = new URL('/auth/login', request.url)
      // loginUrl.searchParams.set('redirect');
      await Logout();
      return NextResponse.redirect(loginUrl)
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER}/api/v1/auth/verify-token`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });


      console.log(res)

      if (!res.ok) {
        console.error('Token verification failed:', await res.text())
        const loginUrl = new URL('/auth/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
      }

      const data = await res.json()
      console.log('Token verification success:', data)

    } catch (err) {
      console.error('Error verifying token:', err)
      return NextResponse.json({ message: 'Token verification failed' }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|assets|public).*)'
  ],
}
