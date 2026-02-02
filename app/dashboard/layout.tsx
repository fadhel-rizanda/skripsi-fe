"use client"

import { useNotificationToast } from "@/hooks/useNotificationToast"
import { Toaster } from "sonner"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    useNotificationToast()

    return (
        <>
            {children}
            <Toaster position="top-right" richColors />
        </>
    )
}