"use client"

import { Suspense } from "react"
import { useNotificationToast } from "@/hooks/useNotificationToast"
import { Toaster } from "sonner"
import { Navbar } from "@/components/navbar/Navbar"

export default function MainLayout({ children }: { children: React.ReactNode }) {
    useNotificationToast()

    return (
        <>
            <Navbar />
            {/* Wrap children with Suspense so client hooks like useSearchParams work reliably in App Router */}
            <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
              {children}
            </Suspense>
            <Toaster position="top-right" richColors />
        </>
    )
}