import api from "@/lib/axios";

export interface ResetPasswordPayload {
    email: string;
    token: string;
    password: string;
    password_confirmation: string;
}

export const authServices = {
    verifyOtp: async (token: string) => {
        try {
            const cleanToken = token.replace(/\s+/g, "");
            await api.post("/api/v1/auth/activation-code/verify", {
                token: cleanToken,
            });
            return {success: true};
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.message || "Verification failed",
            };
        }
    },

    resendOtp: async () => {
        try {
            await api.post("/api/v1/auth/activation-code/resend");
            return {success: true};
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.message || "Failed to resend code",
            };
        }
    },

    sendForgotPasswordEmail: async (email: string) => {
        try {
            await api.post("/api/v1/auth/forgot-password", {email});

            return {success: true};
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.message || "Failed to send reset email",
            };
        }
    },

    resetPassword: async (data: ResetPasswordPayload) => {
        try {
            await api.post("/api/v1/auth/reset-password", {
                email: data.email,
                token: data.token,
                password: data.password,
                password_confirmation: data.password_confirmation,
            });

            return {success: true};
        } catch (error: any) {
            console.log(error)
            return {
                success: false,
                error: error.response?.data?.message || "Failed to reset password",
            };
        }
    },
};