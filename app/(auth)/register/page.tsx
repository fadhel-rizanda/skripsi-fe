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

// This is a Server Component by default in App Router
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
                        <Button variant="ghost" className="w-full" asChild>
                            <Link href="/">Back to Home</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}