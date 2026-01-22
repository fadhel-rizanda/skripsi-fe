"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function OtpVerificationCard() {
  const [otp, setOtp] = useState("")

  return (
    <div className="w-full max-w-lg flex items-center justify-center">
      <Card className="w-full rounded-2xl shadow-xl">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-xl font-semibold">
            Your code was sent to you via email
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* OTP Input */}
          <Input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="XXXXXX"
            maxLength={6}
            className="h-12 text-center text-lg tracking-widest"
          />

          {/* Resend */}
          <p className="text-sm text-muted-foreground">
            Didn’t receive code?{" "}
            <button
              type="button"
              className="font-medium text-primary hover:underline"
            >
              resend code
            </button>
          </p>

          {/* Actions */}
          <div className="space-y-3">
            <Button className="w-full h-11">
              Verify
            </Button>

            <Button
              variant="outline"
              className="w-full h-11"
            >
              Verify Later
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
