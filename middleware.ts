import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET
    })

    const { pathname } = request.nextUrl

    if (!token) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    const user = token.user;

    // By role name
    if (pathname.startsWith('/admin') && user?.role?.name !== 'admin') {
        return NextResponse.rewrite(new URL('/403', request.url))
    }

    // By permission name
    if (pathname.startsWith('/dashboard/pets')) {
        const userPermissions = user?.role?.permissions || []
        const canManagePet = userPermissions.some((p) => p.name === 'manage-pet')
        if (!canManagePet) {
            return NextResponse.rewrite(new URL('/403', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/chat/:path*',
        '/admin/:path*'
    ],
}