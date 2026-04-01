"use client"

import { useSearchParams, useRouter } from "next/navigation"
import SendEmailCard from "@/components/auth/forgot-pass/SendEmailCard"
import ResetPasswordCard from "@/components/auth/forgot-pass/ResetPasswordCard"

export default function ForgotPasswordForm() {
    const searchParams = useSearchParams()
    const router = useRouter()

    const step = searchParams.get("step") || "email"
    const email = searchParams.get("email") || ""
    const token = searchParams.get("token") || ""

    const updateStep = (newStep: string, params: Record<string, string> = {}) => {
        const newParams = new URLSearchParams(searchParams.toString())
        newParams.set("step", newStep)

        Object.entries(params).forEach(([key, value]) => {
            newParams.set(key, value)
        })

        router.push(`?${newParams.toString()}`)
    }

    return (
        <div className="flex flex-col min-h-screen items-center justify-center gap-6 p-10 bg-cover bg-center bg-[url('/assets/bg-img-dog.png')]">
            <div className="flex flex-col text-center gap-2">
                <h1 className="text-3xl font-bold text-white">Forgot your password?</h1>
                <p className="text-white text-lg">Relax, we got you!</p>
            </div>

            {step === "email" && (
                <SendEmailCard
                    onSuccess={(userEmail) => {
                        updateStep("reset", { email: userEmail })
                    }}
                />
            )}

            {step === "reset" && (
                <ResetPasswordCard email={email} token={token} />
            )}
        </div>
    )
}