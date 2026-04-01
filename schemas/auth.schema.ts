import { z } from "zod"

export const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    role: z.enum(["adopter", "provider"]),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character (e.g., !@#$%^&*)"),
    password_confirmation: z.string().min(1, "Please Confirm Password"),
}).refine(
    (data) => data.password === data.password_confirmation,
    {
        message: "Passwords don't match",
        path: ["password_confirmation"],
    }
)

export type RegisterFormData = z.infer<typeof registerSchema>

export const otpSchema = z.object({
    token: z.string()
        .min(1, "Verification code is required"),
})

export type OtpFormInput = z.infer<typeof otpSchema>