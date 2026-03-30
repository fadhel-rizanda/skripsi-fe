"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, AlertCircle, Eye, EyeOff } from "lucide-react"

import { registerUser } from "@/actions/auth.server"
import { registerSchema } from "@/schemas/auth.schema"
import GoogleSignInButton from "@/components/auth/GoogleSignInButton"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import SelectRoleDialog from "@/components/auth/SelectRoleDialog"


type FormValues = z.infer<typeof registerSchema>

export function RegisterForm() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "adopter",
      password: "",
      password_confirmation: "",
    },
  })

  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [selectedRole, setSelectedRole] =
    useState<"adopter" | "provider">("adopter")


  const onSubmit = () => {
    setRoleDialogOpen(true)
  }

  const handleRegisterWithRole = () => {
    form.setValue("role", selectedRole)
    setRoleDialogOpen(false)

    startTransition(async () => {
      try {
        setError("") // Clear previous errors
        const data = form.getValues()
        const result = await registerUser(data)

        if (!result.success) {
          console.error(result.error)
          setError(result.error || "Registration failed")
          return
        }

        // Auto login after successful registration
        if (result.credentials) {
          const signInResult = await signIn("credentials", {
            email: result.credentials.email,
            password: result.credentials.password,
            redirect: false,
          })

          if (signInResult?.error) {
            setError("Registration successful but login failed. Please login manually.")
            setTimeout(() => router.push("/login"), 2000)
            return
          }

          if (signInResult?.ok) {
            router.push("/verify-otp")
            router.refresh()
          }
        }
      } catch (err) {
        console.error("Registration error:", err)
        setError(err instanceof Error ? err.message : "Unexpected error")
      }
    })
  }

  return (
    <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-6 sm:p-8 md:p-10">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Username */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input
                    placeholder="ex: budy"
                    disabled={isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email address</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    disabled={isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        disabled={isPending}
                        className="pr-10"
                        {...field}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isPending}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      aria-pressed={showPassword}
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                      <span className="sr-only">
                        {showPassword ? "Hide password" : "Show password"}
                      </span>
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password_confirmation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        disabled={isPending}
                        className="pr-10"
                        {...field}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isPending}
                      aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                      aria-pressed={showConfirmPassword}
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                      <span className="sr-only">
                        {showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                      </span>
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Remember me */}
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" className="rounded" />
            Remember me
          </label>

          {/* Submit */}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Continue
          </Button>


          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">
              Or continue with
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Google */}
          <GoogleSignInButton />

        </form>
      </Form>

      <SelectRoleDialog
        open={roleDialogOpen}
        onOpenChange={setRoleDialogOpen}
        selectedRole={selectedRole}
        onRoleChange={setSelectedRole}
        onConfirm={handleRegisterWithRole}
        isLoading={isPending}
      />

    </div>
  )
}