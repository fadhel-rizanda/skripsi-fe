"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, AlertCircle } from "lucide-react"

import { registerUser } from "@/actions/auth"
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

type FormValues = z.infer<typeof registerSchema>

export function RegisterForm() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()

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

  const onSubmit = (data: FormValues) => {
    setError("")

    startTransition(async () => {
      try {
        const result = await registerUser(data)

        if (!result.success) {
          setError(result.error || "Registration failed")
          return
        }

        if (result.credentials) {
          const signInResult = await signIn("credentials", {
            email: result.credentials.email,
            password: result.credentials.password,
            redirect: false,
          })

          if (signInResult?.error) {
            router.push("/login")
            return
          }

          router.replace("/dashboard")
          router.refresh()
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unexpected error")
      }
    })
  }

  return (
    <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-10">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

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
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
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
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Role */}
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select your role</FormLabel>

                <FormControl>
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="grid grid-cols-2 gap-4"
                    disabled={isPending}
                  >
                    <FormItem>
                      <FormControl>
                        <RadioGroupItem value="adopter" className="peer hidden" />
                      </FormControl>
                      <FormLabel
                        className="flex cursor-pointer items-center justify-center rounded-lg border py-4 font-medium
                                  peer-data-[state=checked]:bg-blue-600
                                  peer-data-[state=checked]:text-white"
                      >
                        Adopter
                      </FormLabel>
                    </FormItem>

                    <FormItem>
                      <FormControl>
                        <RadioGroupItem value="provider" className="peer hidden" />
                      </FormControl>
                      <FormLabel
                        className="flex cursor-pointer items-center justify-center rounded-lg border py-4 font-medium
                                  peer-data-[state=checked]:bg-green-600
                                  peer-data-[state=checked]:text-white"
                      >
                        Provider
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />


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
    </div>
  )
}
