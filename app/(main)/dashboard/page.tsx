import {getServerSession} from "next-auth"
import {redirect} from "next/navigation"
import {authOptions} from "@/app/api/auth/[...nextauth]/route"
import LogoutButton from "../../../components/auth/LogoutButton"

export default async function DashboardPage() {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect("/login")
    }

    if (session.error === "RefreshAccessTokenError") {
        redirect("/login?error=session-expired")
    }

    const user = session.user

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold">Dashboard</h1>

            <div className="my-4 space-y-2">
                <p>Welcome, {user?.name}!</p>
                <p>Email: {user?.email}</p>

                {user?.role && (
                    <p>Role: {user.role.name}</p>
                )}

                {user?.role?.permissions?.length > 0 && (
                    <div>
                        <p className="font-semibold">Permissions:</p>
                        <ul className="list-inside list-disc">
                            {user.role.permissions.map((perm) => (
                                <li key={perm.id}>{perm.name}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {user?.channels?.length > 0 && (
                    <div>
                        <p className="font-semibold">Channels:</p>
                        <ul className="list-inside list-disc">
                            {user.channels.map(({name, event}, index) => (
                                <li key={name + index}>
                                    <span className="font-medium">{name}</span> — <span
                                    className="italic text-gray-500">{event}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <LogoutButton/>
        </div>
    )
}
