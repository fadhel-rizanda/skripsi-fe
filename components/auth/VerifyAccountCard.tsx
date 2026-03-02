"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Form, FormControl, FormField, FormItem, FormMessage,
} from "@/components/ui/form"
import { Loader2, AlertCircle } from "lucide-react"
import { verifyOtp, resendOtp } from "@/actions/auth"
import { otpSchema, OtpFormInput } from "@/schemas/auth.schema"

export default function OtpVerificationCard() {
  const router = useRouter()
  const { data: session } = useSession()

  const [error, setError] = useState("")
  const [resending, setResending] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  const form = useForm<OtpFormInput>({
    resolver: zodResolver(otpSchema),
    defaultValues: { token: "" },
  })

  async function onSubmit(values: OtpFormInput) {
    setError("")
    setSuccessMessage("")

    try {
      const accessToken = session?.accessToken
      if (!accessToken) {
        setError("You must be logged in to verify")
        return
      }

      const result = await verifyOtp(values.token, accessToken)

      if (!result.success) {
        setError(result.error || "Verification failed")
        return
      }

      router.push("/greeting?verified=true")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
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

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="token"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="XXXXXXXX"
                        maxLength={8}
                        className="h-12 text-center text-lg tracking-widest uppercase"
                        disabled={form.formState.isSubmitting}
                        onChange={(e) => {
                          field.onChange(e.target.value.toUpperCase())
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
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
                  type="submit"
                  className="w-full h-11"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {form.formState.isSubmitting ? "Verifying..." : "Verify"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11"
                  onClick={() => router.push("/profile")}
                >
                  Verify Later
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}