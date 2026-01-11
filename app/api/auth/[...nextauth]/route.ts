import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import NextAuth from "next-auth/next"
import {JWT} from "next-auth/jwt";
import {AuthOptions} from "next-auth";
import { cookies } from 'next/headers'

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

async function refreshAccessToken(token: JWT): Promise<JWT> {
    try {
        const res = await fetch(`${API_URL}/v1/auth/refresh`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                refresh_token: token.refreshToken,
            }),
        })

        const data = await res.json()

        // cek backend response JSON
        if (data.error) {
            console.error("Backend error refreshing token:", data)
            console.error("Access token:", token.accessToken)
            return {
                ...token,
                error: data.message || "RefreshAccessTokenError",
            }
        }

        // update token baru
        return {
            ...token,
            accessToken: data.data.access_token,
            refreshToken: data.data.refresh_token,
            expiresAt: Date.now() + data.data.expires_in * 1000,
            refreshExpiresAt: Date.now() + data.data.refresh_expires_in * 1000,
            error: undefined,
        }
    } catch (error) {
        console.error("Error refreshing access token:", error)
        return {
            ...token,
            error: "RefreshAccessTokenError",
        }
    }
}

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },

            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email and password required")
                }

                try {
                    const res = await fetch(`${API_URL}/v1/auth/login`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                        },
                        body: JSON.stringify({
                            email: credentials.email,
                            password: credentials.password,
                        }),
                    })

                    const data = await res.json()

                    if (!res.ok || data.error) {
                        throw new Error(data.message || "Login failed")
                    }

                    const user = data.data.user
                    const role = user.roles?.[0]

                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: {
                            id: role?.id,
                            name: role?.name,
                            permissions: role?.permissions || [],
                        },
                        avatar: user.avatar,
                        accessToken: data.data.access_token,
                        refreshToken: data.data.refresh_token,
                        expiresAt: Date.now() + data.data.expires_in * 1000,
                        refreshExpiresAt: Date.now() + data.data.refresh_expires_in * 1000,
                    }
                } catch (error: unknown) {
                    console.error("Login error:", error)
                    const message = error instanceof Error ? error.message : "Authentication failed"
                    throw new Error(message)
                }
            },
        }),

        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code",
                },
            },
        }),
    ],

    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === "google") {
                try {
                    // const selectedRole = (user as UserRole).selectedRole || "adopter"
                    const cookieStore = await cookies()
                    const selectedRole = cookieStore.get('selectedRole')?.value || 'adopter'

                    console.log("selected Role: ", selectedRole);

                    const res = await fetch(`${API_URL}/v1/auth/provider`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                        },
                        body: JSON.stringify({
                            provider: account.provider,
                            access_token: account.access_token,
                            role: selectedRole,
                        }),
                    })


                    const data = await res.json()

                    if (!res.ok || data.error) {
                        throw new Error(data.message || "Google login failed")
                    }

                    const userData = data.data.user
                    const role = userData.roles?.[0]

                    user.id = userData.id
                    user.name = userData.name
                    user.email = userData.email
                    user.role = {
                        id: role?.id,
                        name: role?.name,
                        permissions: role?.permissions || [],
                    }
                    user.avatar = userData.avatar
                    user.accessToken = data.data.access_token
                    user.refreshToken = data.data.refresh_token
                    user.expiresAt = Date.now() + data.data.expires_in * 1000
                    user.refreshExpiresAt = Date.now() + data.data.refresh_expires_in * 1000

                    cookieStore.delete('selectedRole')

                    return true
                } catch (error) {
                    console.error("Google sign-in error:", error)
                    return false
                }
            }

            return true
        },

        async jwt({ token, user }): Promise<JWT> {
            if (user) {
                token.accessToken = user.accessToken
                token.refreshToken = user.refreshToken
                token.expiresAt = user.expiresAt
                token.refreshExpiresAt = user.refreshExpiresAt
                token.user = {
                    id: user.id,
                    name: user.name ?? "",
                    email: user.email ?? "",
                    role: user.role,
                    avatar: user.avatar,
                }
            }

            if (!token.expiresAt) {
                return token
            }

            const bufferTime = 5 * 60 * 1000
            if (Date.now() < token.expiresAt - bufferTime) {
                return token
            }

            return await refreshAccessToken(token)
        },

        async session({ session, token }) {
            session.user = token.user
            session.accessToken = token.accessToken
            session.refreshToken = token.refreshToken
            session.expiresAt = token.expiresAt
            session.refreshExpiresAt = token.refreshExpiresAt
            session.error = token.error

            return session
        },
    },

    pages: {
        signIn: "/login",
        error: "/login",
    },

    session: {
        strategy: "jwt",
        maxAge: 14 * 24 * 60 * 60,
    },

    secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }