"use client"

import { useNotificationToast } from "@/hooks/useNotificationToast"
import { Toaster } from "sonner"
import { Navbar } from "@/components/navbar/Navbar"
import { Footer } from "@/components/footer/Footer"

export default function MainLayout({ children }: { children: React.ReactNode }) {
    useNotificationToast()

    return (
        <>
            <Navbar />
            {children}
            <Toaster position="top-right" richColors />
            <Footer />
        </>
    )
}