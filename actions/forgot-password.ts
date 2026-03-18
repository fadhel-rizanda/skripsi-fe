export interface ForgotPasswordResult {
    success: boolean
    error?: string
}

export interface ResetPasswordResult {
    success: boolean
    error?: string
}

const API_URL = process.env.INTERNAL_API_URL || "http://localhost:8000"

export async function sendForgotPasswordEmail(email: string): Promise<ForgotPasswordResult> {
    if (!email) {
        return {
            success: false,
            error: "Email is required",
        }
    }

    try {
        const res = await fetch(`${API_URL}/v1/auth/forgot-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
        })

        const result = await res.json()

        if (!res.ok || result.error) {
            return {
                success: false,
                error: result.message || "Failed to send reset email",
            }
        }

        return {
            success: true,
        }
    } catch (err) {
        console.error("Forgot password error:", err)
        return {
            success: false,
            error: err instanceof Error ? err.message : "An unexpected error occurred",
        }
    }
}

export async function resetPassword(
    email: string,
    token: string,
    password: string,
    passwordConfirmation: string
): Promise<ResetPasswordResult> {
    if (!email || !token || !password) {
        return {
            success: false,
            error: "All fields are required",
        }
    }

    if (password !== passwordConfirmation) {
        return {
            success: false,
            error: "Passwords do not match",
        }
    }

    try {
        const res = await fetch(`${API_URL}/v1/auth/reset-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                token,
                password,
                password_confirmation: passwordConfirmation,
            }),
        })

        const result = await res.json()

        if (!res.ok || result.error) {
            return {
                success: false,
                error: result.message || "Failed to reset password",
            }
        }

        return {
            success: true,
        }
    } catch (err) {
        console.error("Reset password error:", err)
        return {
            success: false,
            error: err instanceof Error ? err.message : "An unexpected error occurred",
        }
    }
}