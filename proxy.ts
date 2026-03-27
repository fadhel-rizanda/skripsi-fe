import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl

    const publicRoutes = [
        '/',
        '/forgot-password',
        '/login',
        '/register',
        '/verify-otp',
        '/pets',
        '/explore',
    ]

    const protectedKeywords = [
        "/create",
        "/edit",
        "/new",
        "/update"
    ]

    const isPublicRoute = pathname === '/' || publicRoutes.filter((r) => r !== '/').some((route) => pathname.startsWith(route));

    const isProtectedByKeyword = protectedKeywords.some((kw) =>
        pathname.includes(kw)
    )

    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET || (() => { throw new Error("NEXTAUTH_SECRET is not defined"); })()
    })

    if (!token && (isProtectedByKeyword || !isPublicRoute)) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    if (token) {
        const user = token.user

        if (!user?.email_verified_at && !pathname.startsWith("/verify-otp")) {
            return NextResponse.redirect(new URL("/verify-otp", request.url))
        }

        if (user?.email_verified_at && !user?.address_street && !pathname.startsWith("/greeting")) {
            return NextResponse.redirect(new URL("/greeting", request.url))
        }

        if (pathname.startsWith('/admin') && user?.role?.name !== 'admin') {
            return NextResponse.rewrite(new URL('/403', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/((?!_next|api|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)).*)',
    ],
}
