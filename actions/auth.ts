"use server"

import {RegisterFormData, registerSchema} from "@/schemas/auth.schema";

export interface RegisterResult {
    success: boolean
    error?: string
    credentials?: {
        email: string
        password: string
    }
}
const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export async function registerUser(input: RegisterFormData): Promise<RegisterResult> {
    let data: unknown

    if (input instanceof FormData) {
        data = {
            name: input.get("name"),
            email: input.get("email"),
            role: input.get("role"),
            password: input.get("password"),
            password_confirmation: input.get("password_confirmation"),
        }
    } else {
        data = input
    }

    const validatedFields = registerSchema.safeParse(data)

    if (!validatedFields.success) {
        return {
            success: false,
            error: validatedFields.error.issues[0].message,
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_confirmation, ...registerData } = validatedFields.data

    try {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(registerData),
        })

        const result = await res.json()

        if (!res.ok || result.error) {
            return {
                success: false,
                error: result.message || "Registration failed. Please try again.",
            }
        }

        return {
            success: true,
            credentials: {
                email: registerData.email,
                password: registerData.password,
            }
        }
    } catch (err) {
        console.error("Registration error:", err)
        return {
            success: false,
            error: err instanceof Error ? err.message : "An unexpected error occurred",
        }
    }
}