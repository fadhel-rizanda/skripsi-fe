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

interface Props {
  onSuccess: (email: string) => void
}

export default function SendEmailCard({ onSuccess }: Props) {
  const [email, setEmail] = useState("")

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Forgot Password</CardTitle>
        <CardDescription>
          We’ll send a verification code to your email.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Input
          type="email"
          placeholder="you@example.com"
          onChange={(e) => setEmail(e.target.value)}
        />
      </CardContent>

      <CardFooter>
        <Button className="w-full" onClick={() => onSuccess(email)}>
          Continue
        </Button>
      </CardFooter>
    </Card>
  )
}
