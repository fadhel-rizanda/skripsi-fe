import OtpVerificationCard from "@/components/auth/VerifyAccountCard"

export default function VerificationPage() {
  return (
    <div 
      className="flex flex-col min-h-screen items-center justify-center gap-6 p-10 bg-cover bg-center bg-[url('/assets/bg-img-dog.png')]"
    >
      <h1 className="text-3xl font-bold text-white">Please verify your account</h1>
      
      <OtpVerificationCard />
    </div>
  )
}