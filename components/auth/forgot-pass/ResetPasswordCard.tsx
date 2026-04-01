"use client"

import {useState} from "react"
import {useRouter} from "next/navigation"
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {Button} from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form"
import {Loader2, EyeOff, Eye, ArrowRight} from "lucide-react"
import {authServices} from "@/services/authServices"
import {toast} from "sonner"
import {ResetPasswordInput, resetPasswordSchema} from "@/schemas/reset.password"

interface Props {
    email: string
    token: string
}

export default function ResetPasswordCard({email, token}: Props) {
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isResending, setIsResending] = useState(false)
    const [showPasswordFields, setShowPasswordFields] = useState(false)

    const form = useForm<ResetPasswordInput>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            token: token || "",
            password: "",
            password_confirmation: "",
        },
    })

    const onSubmit = async (values: ResetPasswordInput) => {
        const result = await authServices.resetPassword({
            email,
            token: values.token,
            password: values.password,
            password_confirmation: values.password_confirmation,
        })

        if (!result.success) {
            const errorMessage = result.error || "Failed to reset password"
            toast.error(errorMessage)

            if (errorMessage.toLowerCase().includes("token") ||
                errorMessage.toLowerCase().includes("expired") ||
                errorMessage.toLowerCase().includes("invalid")) {
                form.setError("token", {
                    message: errorMessage
                })
                setShowPasswordFields(false)
            } else {
                form.setError("password", {
                    message: errorMessage
                })
            }
            return
        }

        toast.success("Password updated successfully!")
        router.push("/login?reset=success")
    }

    const handleResend = async () => {
        setIsResending(true)
        const result = await authServices.sendForgotPasswordEmail(email)
        if (result.success) {
            toast.success("Code resent successfully")
            form.setValue("token", "")
            setShowPasswordFields(false)
        } else {
            toast.error(result.error || "Failed to resend code")
        }
        setIsResending(false)
    }

    const handleNextStep = async () => {
        const tokenValue = form.getValues("token")
        if (!tokenValue || tokenValue.trim().length < 4) {
            form.setError("token", {message: "Please enter a valid verification code"})
            return
        }

        form.clearErrors("token")
        setShowPasswordFields(true)
    }

    const handleBackToToken = () => {
        setShowPasswordFields(false)
        form.clearErrors(["password", "password_confirmation"])
    }

    return (
        <div className="w-full max-w-lg flex items-center justify-center">
            <Card className="w-full rounded-2xl shadow-xl">
              <CardHeader className="text-center space-y-2">
                <CardTitle className="text-xl font-semibold">
                  Your code was sent to you via email
                </CardTitle>
              </CardHeader>

                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="token"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="XXXXXX"
                                                    className="h-12 text-center text-lg tracking-[0.3em] font-mono"
                                                    disabled={form.formState.isSubmitting || showPasswordFields}
                                                    maxLength={64}
                                                    onChange={(e) => {
                                                        field.onChange(e)
                                                        if (form.formState.errors.token) {
                                                            form.clearErrors("token")
                                                        }
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />

                                {!showPasswordFields && (
                                    <div className="space-y-6">
                                        <p className="text-sm text-muted-foreground">
                                            Didn't receive code?{" "}
                                            <button
                                                type="button"
                                                onClick={handleResend}
                                                disabled={isResending}
                                                className="font-medium text-primary hover:underline disabled:opacity-50"
                                            >
                                                {isResending ? "Resending..." : "Resend code"}
                                            </button>
                                        </p>
                                        <Button
                                            type="button"
                                            className="w-full h-11"
                                            onClick={handleNextStep}
                                        >
                                            Continue to Password <ArrowRight className="ml-2 h-4 w-4"/>
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {showPasswordFields && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t"/>
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span
                                                className="bg-background px-2 text-muted-foreground">Set New Password</span>
                                        </div>
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>New Password</FormLabel>
                                                <div className="relative">
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            type={showPassword ? "text" : "password"}
                                                            placeholder="Min 8 characters"
                                                            className="pr-10 h-11"
                                                            autoFocus
                                                        />
                                                    </FormControl>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                                        tabIndex={-1}
                                                    >
                                                        {showPassword ? <EyeOff className="h-4 w-4"/> :
                                                            <Eye className="h-4 w-4"/>}
                                                    </Button>
                                                </div>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="password_confirmation"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Confirm Password</FormLabel>
                                                <div className="relative">
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            type={showConfirmPassword ? "text" : "password"}
                                                            placeholder="Repeat password"
                                                            className="pr-10 h-11"
                                                        />
                                                    </FormControl>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                                        tabIndex={-1}
                                                    >
                                                        {showConfirmPassword ? <EyeOff className="h-4 w-4"/> :
                                                            <Eye className="h-4 w-4"/>}
                                                    </Button>
                                                </div>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />

                                    <Button
                                        type="submit"
                                        className="w-full h-11"
                                        disabled={form.formState.isSubmitting}
                                    >
                                        {form.formState.isSubmitting ? (
                                            <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Updating...</>
                                        ) : "Update Password"}
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="w-full text-xs text-muted-foreground"
                                        onClick={handleBackToToken}
                                        disabled={form.formState.isSubmitting}
                                    >
                                        Change verification code
                                    </Button>
                                </div>
                            )}
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}