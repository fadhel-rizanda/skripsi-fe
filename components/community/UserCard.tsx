import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { UserProfile } from "@/types/user";
import { ExternalLink } from "lucide-react";
import { isValidUrl } from "@/lib/utils";
import clsx from "clsx";

interface UserCardProps {
    user: UserProfile;
}

export function UserCard({ user }: UserCardProps) {
    const joinedYear = new Date(user.created_at).getFullYear();
    const safeAvatarUrl = isValidUrl(user.avatar ?? '') ? user.avatar : undefined;
    const isDeactivated = !user.is_active;

    return (
        <Card className={clsx("rounded-3xl border-0 shadow-sm hover:shadow-md transition-shadow p-4 sm:p-6 bg-white", isDeactivated && "opacity-75")}>
            <div className="flex justify-between items-start">
                <div className="flex gap-5">
                    <Avatar className={clsx("h-12 w-12 sm:h-16 sm:w-16 border border-gray-100 rounded-full bg-[#E6E0D2]", isDeactivated && "grayscale")}>
                        {safeAvatarUrl ? (
                            <AvatarImage src={safeAvatarUrl} alt={user.name} className="object-cover" />
                        ) : (
                            <AvatarFallback className="rounded-full bg-pink-100 text-amber-700 font-semibold text-base sm:text-xl">
                                {user.name.substring(0,1).toUpperCase()}
                            </AvatarFallback>
                        )}
                    </Avatar>

                    <div className="flex flex-col pt-1">
                        <div className="flex flex-col gap-1 mb-1">
                            <h3 className={clsx("font-bold text-base sm:text-[18px] leading-tight max-w-32 sm:max-w-48 md:max-w-52 truncate", isDeactivated ? "text-gray-500 italic" : "text-gray-900")}>
                                {user.name}
                            </h3>
                            {isDeactivated && (
                                <Badge variant="outline" className="bg-red-50 text-red-500 border-red-200 text-[10px] w-fit px-1.5 py-0 leading-none h-4">
                                    Deactivated
                                </Badge>
                            )}
                        </div>
                        <p className="text-gray-500 text-xs sm:text-[15px] mb-2 sm:mb-3">Joined in {joinedYear}</p>
                        {!isDeactivated ? (
                            <Link
                                href={`/profile/${user.id}`}
                                className="font-bold text-black text-xs sm:text-[15px] hover:underline flex items-center gap-1.5 cursor-pointer w-fit"
                            >
                                View Profile
                                <ExternalLink className="h-4 w-4" />
                            </Link>
                        ) : (
                            <span className="text-gray-400 text-xs sm:text-[15px] italic">Profile Unavailable</span>
                        )}
                    </div>
                </div>

                {user.role_name && !isDeactivated && (
                    <Badge variant="secondary" className="bg-[#E2F7E9] text-[#1E9E41] hover:bg-[#D1F7E1] font-medium px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full capitalize text-xs sm:text-[14px] leading-none shrink-0 pointer-events-none mt-1">
                        {user.role_name}
                    </Badge>
                )}
            </div>
        </Card>
    );
}
