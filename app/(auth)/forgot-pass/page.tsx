"use client"

import { useState } from "react"
import SendEmailCard from "@/components/auth/forgot-pass/SendEmailCard"
import VerifyOtpCard from "@/components/auth/forgot-pass/VerifyOTPCard"
import ResetPasswordCard from "@/components/auth/forgot-pass/ResetPasswordCard"

type Step = "email" | "otp" | "reset"

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email")
  const [email, setEmail] = useState("")

  return (
    <div 
      className="flex flex-col min-h-screen items-center justify-center gap-6 p-10"
      style={{
        backgroundImage: "url('/assets/bg-img-dog.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
        <div className="flex flex-col text-center gap-2">
            <h1 className="text-3xl font-bold text-white">Forgot your password?</h1>
            <p className="text-white">Relax, we got you!</p>
        </div>
        
        {step === "email" && (
            <SendEmailCard
            onSuccess={(email) => {
                setEmail(email)
                setStep("otp")
            }}
            />
        )}

        {step === "otp" && (
            <VerifyOtpCard
            email={email}
            onSuccess={() => setStep("reset")}
            />
        )}

        {step === "reset" && (
            <ResetPasswordCard email={email} />
        )}
    </div>
  )
}
