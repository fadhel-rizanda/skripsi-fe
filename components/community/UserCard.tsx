import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { UserProfile } from "@/types/user";
import { ExternalLink } from "lucide-react";

interface UserCardProps {
    user: UserProfile;
}

export function UserCard({ user }: UserCardProps) {
    const joinedYear = user.created_at ? new Date(user.created_at).getFullYear() : new Date().getFullYear();
    const isValidAvatarUrl = user.avatar?.startsWith('http://') || user.avatar?.startsWith('https://');
    const safeAvatarUrl = isValidAvatarUrl ? user.avatar : undefined;

    return (
        <Card className="rounded-[16px] border-0 shadow-sm hover:shadow-md transition-shadow p-6 bg-white">
            <div className="flex justify-between items-start">
                <div className="flex gap-5">
                    <Avatar className="h-16 w-16 border border-gray-100 rounded-full bg-[#E6E0D2]">
                        {safeAvatarUrl ? (
                            <AvatarImage src={safeAvatarUrl} alt={user.name} className="object-cover" />
                        ) : (
                            <AvatarFallback className="bg-[#E6E0D2] text-[10px] leading-[12px] font-medium text-gray-500 flex flex-col items-center justify-center rounded-full w-full h-full border border-transparent">
                                <span>PAWS</span>
                                <span>&</span>
                                <span>whiskers</span>
                            </AvatarFallback>
                        )}
                    </Avatar>

                    <div className="flex flex-col pt-1">
                        <h3 className="font-bold text-gray-900 text-[18px] leading-tight mb-1">{user.name}</h3>
                        <p className="text-gray-500 text-[15px] mb-3">Joined in {joinedYear}</p>
                        <Link
                            href={`/profile/${user.id}`}
                            className="font-bold text-black text-[15px] hover:underline flex items-center gap-1.5 cursor-pointer"
                        >
                            View Profile
                            <ExternalLink className="h-4 w-4" />
                        </Link>
                    </div>
                </div>

                {user.role_name && (
                    <Badge variant="secondary" className="bg-[#E2F7E9] text-[#1E9E41] hover:bg-[#D1F7E1] font-medium px-4 py-1.5 rounded-full capitalize text-[14px] leading-none shrink-0 pointer-events-none mt-1">
                        {user.role_name}
                    </Badge>
                )}
            </div>
        </Card>
    );
}
