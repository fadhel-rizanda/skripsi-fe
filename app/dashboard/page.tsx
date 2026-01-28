import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import LogoutButton from "../../components/auth/LogoutButton"

export default async function DashboardPage() {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect("/login")
    }

    if (session.error === "RefreshAccessTokenError") {
        redirect("/login?error=session-expired")
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold">Dashboard</h1>

            <div className="my-4 space-y-2">
                <p>Welcome, {session.user.name}!</p>
                <p>Email: {session.user.email}</p>
                <p>Role: {session.user.role.name}</p>

                <div>
                    <p className="font-semibold">Permissions:</p>
                    <ul className="list-inside list-disc">
                        {session.user.role.permissions.map((perm) => (
                            <li key={perm.id}>{perm.name}</li>
                        ))}
                    </ul>
                </div>
            </div>

            <LogoutButton/>
        </div>
    )
}