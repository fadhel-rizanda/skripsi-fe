import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export default async function FindPetLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions)

    // Redirect ke login jika tidak ada session
    if (!session) {
        redirect("/login")
    }

    // Redirect ke login jika token expired
    if (session.error === "RefreshAccessTokenError") {
        redirect("/login?error=session-expired")
    }

    return <>{children}</>
}
