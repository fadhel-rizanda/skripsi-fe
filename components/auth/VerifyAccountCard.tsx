"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react" // Add this import
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"
import { verifyOtp, resendOtp } from "@/actions/auth"

export default function OtpVerificationCard() {
  const router = useRouter()
  const { data: session } = useSession() // Get session
  
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [resending, setResending] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  const handleVerify = async () => {
    setError("")
    setSuccessMessage("")
    setLoading(true)

    try {
      const accessToken = session?.accessToken
      if (!accessToken) {
        setError("You must be logged in to verify")
        return
      }

      const result = await verifyOtp(otp, accessToken)
      
      if (!result.success) {
        setError(result.error || "Verification failed")
        return
      }

      // Success - redirect to dashboard
      router.push("/dashboard?verified=true")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError("")
    setSuccessMessage("")
    setResending(true)

    try {
      const accessToken = session?.accessToken
      if (!accessToken) {
        setError("You must be logged in to resend code")
        return
      }

      const result = await resendOtp(accessToken)
      
      if (!result.success) {
        setError(result.error || "Failed to resend OTP")
        return
      }

      // Show success message
      setSuccessMessage("OTP has been resent to your email")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="w-full max-w-lg flex items-center justify-center">
      <Card className="w-full rounded-2xl shadow-xl">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-xl font-semibold">
            Your code was sent to you via email
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert className="border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100">
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          {/* OTP Input */}
          <Input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="XXXXXX"
            maxLength={6}
            className="h-12 text-center text-lg tracking-widest"
            disabled={loading}
          />

          {/* Resend */}
          <p className="text-sm text-muted-foreground">
            Didn't receive code?{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="font-medium text-primary hover:underline disabled:opacity-50"
            >
              {resending ? "Sending..." : "Resend code"}
            </button>
          </p>

          {/* Actions */}
          <div className="space-y-3">
            <Button 
              onClick={handleVerify}
              className="w-full h-11"
              disabled={loading || !otp}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Verifying..." : "Verify"}
            </Button>

            <Button
              variant="outline"
              className="w-full h-11"
              onClick={() => router.push("/dashboard")}
            >
              Verify Later
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}