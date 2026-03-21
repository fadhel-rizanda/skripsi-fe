export interface VerifyOtpResult {
    success: boolean
    error?: string
}

export interface ResendOtpResult {
    success: boolean
    error?: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export async function verifyOtp(token: string, accessToken: string): Promise<VerifyOtpResult> {
    const cleanToken = token.replace(/\s+/g, "")

    if (!cleanToken) {
        return {
            success: false,
            error: "Activation code is required",
        }
    }

    if (!accessToken) {
        return {
            success: false,
            error: "You must be logged in to verify",
        }
    }

    try {
        const res = await fetch(`${API_URL}/api/v1/auth/activation-code/verify`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                token: cleanToken,
            }),
        })

        const result = await res.json()

        if (!res.ok || result.error) {
            return {
                success: false,
                error: result.message || "Verification failed",
            }
        }

        return {
            success: true,
        }
    } catch (err) {
        console.error("OTP verification error:", err)
        return {
            success: false,
            error: err instanceof Error ? err.message : "An unexpected error occurred",
        }
    }
}

export async function resendOtp(accessToken: string): Promise<ResendOtpResult> {
    if (!accessToken) {
        return {
            success: false,
            error: "You must be logged in to resend code",
        }
    }

    try {
        const res = await fetch(`${API_URL}/api/v1/auth/activation-code/resend`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`,
            },
        })

        const result = await res.json()

        if (!res.ok || result.error) {
            return {
                success: false,
                error: result.message || "Failed to resend code",
            }
        }

        return {
            success: true,
        }
    } catch (err) {
        console.error("Resend OTP error:", err)
        return {
            success: false,
            error: err instanceof Error ? err.message : "An unexpected error occurred",
        }
    }
}