import UserProfileDashboard from "@/components/user-details/UserProfileDashboard"

interface Props {
    params: Promise<{ id: string }>
}

// Publicly accessible — no session required to view.
// - No session  → view-only
// - Session + id matches session.user.id → view + edit via PUT /v1/profile
export default async function PublicProfilePage({ params }: Props) {
    const { id } = await params
    return <UserProfileDashboard userId={id} />
}
