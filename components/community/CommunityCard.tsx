import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Community } from "@/types/community";
import { ExternalLink } from "lucide-react";
import { isValidUrl } from "@/lib/utils";

interface CommunityCardProps {
    community: Community;
}

export function CommunityCard({ community }: CommunityCardProps) {
    const rawImageUrl = community.image_url || community.attachment?.public_url;
    const safeImageUrl = isValidUrl(rawImageUrl ?? '') ? rawImageUrl : undefined;

    return (
        <Card className="rounded-2xl border-0 bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow p-4 sm:p-6">
            <div className="flex gap-4">
                {/* Community Image Section */}
                <div className="shrink-0">
                    <Avatar className="h-12 w-12 sm:h-16 sm:w-16 border border-gray-100 rounded-full bg-pink-100">
                        {safeImageUrl ? (
                            <AvatarImage
                                src={safeImageUrl}
                                alt={community.name}
                                className="object-cover"
                            />
                        ) : null}
                        <AvatarFallback className="rounded-full bg-pink-100 text-amber-700 font-semibold text-base sm:text-xl">
                            {community.name.substring(0, 1).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                </div>

                {/* Content Section */}
                <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-gray-900 text-base sm:text-lg">{community.name}</h3>
                    </div>

                    <p className="text-gray-700 leading-relaxed text-xs sm:text-sm mt-1.5 line-clamp-3">
                        {community.description}
                    </p>

                    <Link
                        href={`/explore/communities/${community.id}`}
                        className="mt-2 sm:mt-3 inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-gray-900 hover:text-green-600 transition-colors"
                    >
                        View Community
                        <ExternalLink className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </Card>
    );
}
