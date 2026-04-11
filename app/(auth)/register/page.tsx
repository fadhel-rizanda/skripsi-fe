import Link from "next/link"
import { RegisterForm } from "@/components/auth/RegisterForm"

export default function RegisterPage() {
  return (
    <div
      className="flex flex-col min-h-screen items-center justify-center gap-4 p-4 sm:p-10"
      style={{
        backgroundImage: "url('/assets/bg-img-dog.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white text-center drop-shadow-md">
        Welcome to Pawsitive!
      </h1>
      <p className="text-sm sm:text-base text-white text-center drop-shadow-sm">
        Ready to find your new best friend?
      </p>

      <RegisterForm />

      <p className="text-sm sm:text-base text-white text-center drop-shadow-sm">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold underline">
          Login now
        </Link>
      </p>
    </div>
  )
}
