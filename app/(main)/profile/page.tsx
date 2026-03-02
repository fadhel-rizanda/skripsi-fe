"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Icon } from "@iconify/react"
import AdopterProfileDashboard from "@/components/user-details/AdopterProfile"
import ProviderProfileDashboard from "@/components/user-details/ProviderProfile"

export default function ProfilePage() {
    const { data: session, status } = useSession()

    if (status === "loading") {
        return (
            <div className="p-10 text-center">
                <Icon icon="ph:circle-notch" className="w-8 h-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading profile...</p>
            </div>
        )
    }

    if (!session) {
        redirect("/login")
    }

    const roleName = session.user?.role?.name

    if (roleName === "provider") {
        return <ProviderProfileDashboard />
    }

    return <AdopterProfileDashboard />
}
