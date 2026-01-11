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
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-10 space-y-6"
    >
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Username */}
      <div>
        <label className="text-sm font-medium text-gray-700">Username</label>
        <input
          {...form.register("name")}
          placeholder="ex: budy"
          disabled={isPending}
          className="mt-1 w-full rounded-lg border px-4 py-3"
        />
        <p className="text-xs text-red-500 mt-1">
          {form.formState.errors.name?.message}
        </p>
      </div>

      {/* Email */}
      <div>
        <label className="text-sm font-medium text-gray-700">Email address</label>
        <input
          {...form.register("email")}
          type="email"
          placeholder="you@example.com"
          disabled={isPending}
          className="mt-1 w-full rounded-lg border px-4 py-3"
        />
        <p className="text-xs text-red-500 mt-1">
          {form.formState.errors.email?.message}
        </p>
      </div>

      {/* Passwords */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Password</label>
          <input
            {...form.register("password")}
            type="password"
            placeholder="••••••••"
            disabled={isPending}
            className="mt-1 w-full rounded-lg border px-4 py-3"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">
            Confirm Password
          </label>
          <input
            {...form.register("password_confirmation")}
            type="password"
            placeholder="••••••••"
            disabled={isPending}
            className="mt-1 w-full rounded-lg border px-4 py-3"
          />
        </div>
      </div>

      {/* Role selector */}
      <div>
        <label className="text-sm font-medium text-gray-700">
          Select your role
        </label>
        <div className="mt-2 grid grid-cols-2 gap-4">
          {(["adopter", "provider"] as const).map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => form.setValue("role", role)}
              className={`rounded-lg border py-3 font-medium transition
                ${
                  form.watch("role") === role
                    ? "bg-blue-600 text-white"
                    : "bg-white hover:bg-gray-50"
                }`}
            >
              {role === "adopter" ? "Adopter" : "Provider"}
            </button>
          ))}
        </div>
      </div>

      {/* Remember */}
      <label className="flex items-center gap-2 text-sm text-gray-600">
        <input type="checkbox" className="rounded" />
        Remember me
      </label>

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-black text-white py-3 rounded-lg flex justify-center"
      >
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Continue
      </button>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">Or continue with</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Google */}
      <GoogleSignInButton />
    </form>
  )
}
