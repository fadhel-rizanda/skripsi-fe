"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"

interface Props {
  email: string
  onSuccess: (token: string) => void
}

export default function VerifyOtpCard({ email, onSuccess }: Props) {
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleVerify = () => {
    if (!otp || otp.length < 6) {
      setError("Please enter a valid code")
      return
    }

    // Pass the token to the next step (reset password)
    // Backend will verify the token when resetting password
    onSuccess(otp)
  }

  const handleResend = async () => {
    // You can reuse the sendForgotPasswordEmail function here
    setError("")
    // Import and call sendForgotPasswordEmail(email) if needed
    alert("Code resent to your email")
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

          {/* OTP Input */}
          <Input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="XXXXXX"
            maxLength={8}
            className="h-12 text-center text-lg tracking-widest"
            disabled={loading}
          />

          {/* Resend */}
          <p className="text-sm text-muted-foreground">
            Didn't receive code?{" "}
            <button
              type="button"
              onClick={handleResend}
              className="font-medium text-primary hover:underline"
            >
              Resend code
            </button>
          </p>

          {/* Actions */}
          <div className="space-y-3">
            <Button 
              className="w-full" 
              onClick={handleVerify}
              disabled={loading || !otp}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Verifying..." : "Verify"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}