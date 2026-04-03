import { z } from "zod"

export const resetPasswordSchema = z.object({
    token: z.string()
        .min(1, "Verification code is required"),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .max(255, "Password must be less than 255 characters")
        .regex(/[A-Z]/, "Include at least one uppercase letter")
        .regex(/[a-z]/, "Include at least one lowercase letter")
        .regex(/[0-9]/, "Include at least one number")
        .regex(/[^A-Za-z0-9]/, "Include at least one special character"),
    password_confirmation: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.password_confirmation, {
    message: "Passwords don't match",
    path: ["password_confirmation"],
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;