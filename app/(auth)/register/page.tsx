import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {RegisterForm} from "@/components/auth/RegisterForm";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

export default function RegisterPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Create Account</CardTitle>
                    <CardDescription>Sign up to get started</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    <RegisterForm/>

                    <div className="space-y-2">
                        <Button variant="outline" className="w-full" asChild>
                            <Link href="/login">Already have an account?</Link>
                        </Button>
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Or continue with</span>
                            </div>
                        </div>

                        <GoogleSignInButton/>
                        <Button variant="link" className="w-full" asChild>
                            <Link href="/">Back to Home</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}