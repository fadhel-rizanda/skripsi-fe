import LoginForm from "@/components/auth/LoginForm"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div
      className="flex flex-col min-h-screen items-center justify-center gap-6 p-4 sm:p-10"
      style={{
        backgroundImage: "url('/assets/bg-img-dog.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white text-center drop-shadow-md">
        Welcome back, animal lover!
      </h1>

      <LoginForm />

      <p className="text-sm sm:text-base text-white text-center drop-shadow-sm">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold underline">
          Sign up
        </Link>
      </p>
    </div>
  )
}
