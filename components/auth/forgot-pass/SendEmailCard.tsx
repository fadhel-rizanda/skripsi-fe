"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"
import { sendForgotPasswordEmail } from "@/actions/forgot-password"
import Link from "next/link";

interface Props {
  onSuccess: (email: string) => void
}

export default function SendEmailCard({ onSuccess }: Props) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    setError("")
    setLoading(true)

    try {
      const result = await sendForgotPasswordEmail(email)
      
      if (!result.success) {
        setError(result.error || "Failed to send reset email")
        return
      }

      onSuccess(email)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Forgot Password</CardTitle>
                <CardDescription>
                    We'll send a verification code to your email.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                />
            </CardContent>

            <CardFooter>
                <Button
                    className="w-full"
                    onClick={handleSubmit}
                    disabled={loading || !email}
                >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {loading ? "Sending..." : "Continue"}
                </Button>
            </CardFooter>
        </Card>
        <p className="text-white">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold underline">
                Login now
            </Link>
        </p>
    </>
  )
}