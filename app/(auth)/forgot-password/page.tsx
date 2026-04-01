import { Suspense } from "react"
import ForgotPasswordForm from "@/components/auth/forgot-pass/ForgotPasswordForm"
import { Loader2 } from "lucide-react"

export default function ForgotPasswordPage() {
    return (
        <Suspense
            fallback={
                <div className="flex flex-col min-h-screen items-center justify-center bg-cover bg-center bg-[url('/assets/bg-img-dog.png')]">
                    <Loader2 className="h-10 w-10 animate-spin text-white" />
                </div>
            }
        >
            <ForgotPasswordForm />
        </Suspense>
    )
}