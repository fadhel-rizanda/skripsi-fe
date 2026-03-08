import { z } from "zod"

export const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    role: z.enum(["adopter", "provider"]),
    password: z.string().min(8, "Password must be at least 8 characters"),
    password_confirmation: z.string().min(8, "Please Confirm Password"),
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
        .transform((val) => val.trim().toUpperCase())
        .pipe(
            z.string()
                .regex(/^[A-Z0-9]{8}$/, "Token must be exactly 8 characters")
        ),
})

export type OtpFormInput = z.infer<typeof otpSchema>
