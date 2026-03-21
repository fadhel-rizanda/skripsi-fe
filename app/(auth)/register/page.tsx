import Link from "next/link"
import { RegisterForm } from "@/components/auth/RegisterForm"

export default function RegisterPage() {
  return (
    <div
      className="flex flex-col min-h-screen items-center justify-center gap-4 p-10"
      style={{
        backgroundImage: "url('/assets/bg-img-dog.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <h1 className="text-3xl font-bold text-white">Welcome to Pawsitive!</h1>
      <p className="text-white">
        Ready to find your new best friend?
      </p>

      <RegisterForm />

      <p className="text-white">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold underline">
          Login now
        </Link>
      </p>
    </div>
  )
}
