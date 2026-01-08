import {UserProfile} from "@/types";

declare module "next-auth" {
    interface User extends UserProfile {
        accessToken:  string
        refreshToken: string
        expiresAt:  number
        refreshExpiresAt: number
    }

    interface Session {
        user: UserProfile
        accessToken: string
        refreshToken: string
        expiresAt: number
        refreshExpiresAt: number
        error?: string
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        accessToken: string
        refreshToken: string
        expiresAt: number
        refreshExpiresAt: number
        user: UserProfile
        error?: string
    }
}