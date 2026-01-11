import LoginForm from "@/components/auth/LoginForm"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div 
      className="flex flex-col min-h-screen items-center justify-center gap-6 p-10"
      style={{
        backgroundImage: "url('/assets/bg-img-dog.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <h1 className="text-3xl font-bold text-white">Welcome back, animal lover!</h1>
      
      <LoginForm />

      <p className="text-white">
        Don’t have an account?{" "}
        <Link href="/register" className="font-semibold underline">
          Sign up
        </Link>
      </p>
    </div>

    
  )
}
