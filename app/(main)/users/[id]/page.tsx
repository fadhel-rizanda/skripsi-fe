import UserProfileDashboard from "@/components/user-details/UserProfileDashboard"

interface Props {
    params: Promise<{ id: string }>
}

export default async function PublicUserProfilePage({ params }: Props) {
    const { id } = await params
    return <UserProfileDashboard userId={id} />
}
