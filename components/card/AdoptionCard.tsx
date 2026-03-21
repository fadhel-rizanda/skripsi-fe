"use client";

import {Adoption} from "@/types/adoption";
import {Card, CardContent} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {Icon} from "@iconify/react";
import {isValidUrl} from "@/lib/utils";
import Image from "next/image";
import {UserProfile} from "@/types";
import ChatButton from "@/components/button/ChatButton";
import {useRouter} from "next/navigation";
import {parseColorCode} from "@/lib/color";

interface AdoptionCardProps {
    adoption: Adoption;
    currentUser?: UserProfile;
}

function UserRow({
                     name,
                     email,
                     avatar,
                     avatarFallback,
                     chatTargetId,
                     canChat,
                 }: {
    name: string;
    email: string;
    avatar?: string;
    avatarFallback: string;
    chatTargetId?: string;
    canChat: boolean;
}) {
    return (
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                {avatar && isValidUrl(avatar) ? (
                    <Image
                        src={avatar}
                        alt={name}
                        fill
                        priority
                        className="rounded-full object-cover"
                        sizes="32px"
                        onError={() => console.error("Image failed to load:", avatar)}
                    />
                ) : (
                    <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold">
                        {avatarFallback}
                    </AvatarFallback>
                )}
            </Avatar>
            <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{name}</p>
                <p className="text-xs text-gray-500 truncate">{email}</p>
            </div>
            {canChat && chatTargetId && (
                <ChatButton targetUserId={chatTargetId} label="Chat"/>
            )}
        </div>
    );
}

export function AdoptionCard({adoption, currentUser}: AdoptionCardProps) {
    const role = currentUser?.role.name;

    const canChatProvider = role === "adopter" || role === "admin";
    const canChatAdopter = role === "provider" || role === "admin";
    const router = useRouter();

    return (
        <Card
            className="group max-w-4xl w-full hover:shadow-lg transition-all duration-300 border-gray-200 overflow-hidden p-0 gap-0">
            {/* Header */}
            <div
                onClick={() => router.push(`/adoptions/${adoption.id}`)}
                className="bg-linear-to-br p-6 border-b border-gray-100 cursor-pointer"
            >
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-xl shadow-sm">
                            <Icon icon="lucide:paw-print" className="w-5 h-5"/>
                        </div>
                        <div>
                            <div className="text-lg flex items-center gap-1">
                                <span className="font-semibold">{adoption.pet.name}</span>
                                <span className="text-gray-400">-</span>
                                <span className="font-light text-sm">{adoption.pet.id}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-0.5">
                                Adoption ID: {adoption.id}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-end gap-2">
                        <Badge
                            variant="outline"
                            className="font-medium"
                            style={parseColorCode(adoption.stage_tag.color_code || "")}
                        >
                            {adoption.stage_tag.name}
                        </Badge>
                        <Badge
                            variant="outline"
                            className="font-medium"
                            style={parseColorCode(adoption.status.color_code || "")}
                        >
                            {adoption.status.name}
                        </Badge>

                    </div>
                </div>
            </div>

            <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Provider */}
                    <div className="space-y-3">
                        <div
                            className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                            <Icon icon="lucide:user" className="w-3.5 h-3.5"/>
                            Provider
                        </div>
                        <UserRow
                            name={adoption.provider.name}
                            email={adoption.provider.email}
                            avatar={adoption.provider.avatar}
                            avatarFallback={adoption.provider.name.charAt(0).toUpperCase() || "P"}
                            chatTargetId={adoption.provider.id}
                            canChat={canChatProvider}
                        />
                    </div>

                    {/* Adopter */}
                    <div className="space-y-3">
                        <div
                            className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                            <Icon icon="lucide:user-heart" className="w-3.5 h-3.5"/>
                            Adopter
                        </div>
                        <UserRow
                            name={adoption.adopter.name}
                            email={adoption.adopter.email}
                            avatar={adoption.adopter.avatar}
                            avatarFallback={adoption.adopter.name.charAt(0).toUpperCase() || "A"}
                            chatTargetId={adoption.adopter.id}
                            canChat={canChatAdopter}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
                    <Icon icon="lucide:calendar" className="w-3.5 h-3.5"/>
                    <span>
                        Created{" "}
                        {new Date(adoption.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                        })}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}