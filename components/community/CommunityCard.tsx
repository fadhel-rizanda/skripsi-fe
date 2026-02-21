import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Community } from "@/types/community";
import { ExternalLink } from "lucide-react";

interface CommunityCardProps {
    community: Community;
}

export function CommunityCard({ community }: CommunityCardProps) {
    return (
        <Card className="rounded-2xl border-0 bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow p-6">
            <div className="flex gap-4">
                {/* Community Image Section */}
                <div className="shrink-0">
                    <Avatar className="h-16 w-16 border border-gray-100 rounded-full bg-pink-100">
                        <AvatarImage
                            src={community.image_url || community.attachment?.public_url || undefined}
                            alt={community.name}
                            className="object-cover"
                        />
                        <AvatarFallback className="rounded-full bg-pink-100 text-amber-700 font-semibold text-xl">
                            {community.name.substring(0, 1).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                </div>

                {/* Content Section */}
                <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-gray-900 text-lg">{community.name}</h3>
                    </div>

                    <p className="text-gray-700 leading-relaxed text-sm mt-1.5 line-clamp-3">
                        {community.description}
                    </p>

                    <Link
                        href={`/community/all-communities/${community.id}`}
                        className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-gray-900 hover:text-green-600 transition-colors"
                    >
                        View Profile
                        <ExternalLink className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </Card>
    );
}
