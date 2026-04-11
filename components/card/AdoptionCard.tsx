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
import type { KeyboardEvent } from "react";

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
        <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <Avatar className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-white shadow-sm">
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
                    <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold text-xs sm:text-sm">
                        {avatarFallback}
                    </AvatarFallback>
                )}
            </Avatar>
            <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate text-sm sm:text-base">{name}</p>
                <p className="text-[10px] sm:text-xs text-gray-500 truncate">{email}</p>
            </div>
            {canChat && chatTargetId && (
                <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                    <ChatButton targetUserId={chatTargetId} label="Chat"/>
                </div>
            )}
        </div>
    );
}

export function AdoptionCard({adoption, currentUser}: AdoptionCardProps) {
    const role = currentUser?.role.name;

    const canChatProvider = role === "adopter" || role === "admin";
    const canChatAdopter = role === "provider" || role === "admin";
    const router = useRouter();
    const adoptionHref = `/adoptions/${adoption.id}`;

    const handleCardNavigate = () => {
        router.push(adoptionHref);
    };

    const handleCardKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleCardNavigate();
        }
    };

    return (
        <Card
            role="link"
            tabIndex={0}
            aria-label={`Open adoption details for ${adoption.pet.name}`}
            onClick={handleCardNavigate}
            onKeyDown={handleCardKeyDown}
            className="group max-w-4xl w-full hover:shadow-md hover:border-green-400 hover:-translate-y-0.5 cursor-pointer transition-all duration-300 border-gray-200 overflow-hidden p-0 gap-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
        >
            {/* Header */}
            <div className="bg-linear-to-br p-4 sm:p-6 border-b border-gray-100 group-hover:bg-green-50/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-white rounded-xl shadow-sm shrink-0">
                            <Icon icon="lucide:paw-print" className="w-4 h-4 sm:w-5 sm:h-5"/>
                        </div>
                        <div className="min-w-0">
                            <div className="text-base sm:text-lg flex flex-wrap items-center gap-1">
                                <span className="font-semibold truncate">{adoption.pet.name}</span>
                                <span className="text-gray-400 hidden sm:inline">-</span>
                                <span className="font-light text-xs sm:text-sm text-gray-500">{adoption.pet.id}</span>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-600 mt-0.5 break-all">
                                Adoption ID: {adoption.id}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pl-11 sm:pl-0">
                        <Badge
                            variant="outline"
                            className="font-medium text-[10px] sm:text-xs"
                            style={parseColorCode(adoption.stage_tag.color_code || "")}
                        >
                            {adoption.stage_tag.name}
                        </Badge>
                        <Badge
                            variant="outline"
                            className="font-medium text-[10px] sm:text-xs"
                            style={parseColorCode(adoption.status.color_code || "")}
                        >
                            {adoption.status.name}
                        </Badge>

                    </div>
                </div>
            </div>

            <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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
                <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-100 flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-500">
                    <Icon icon="lucide:calendar" className="w-3 h-3 sm:w-3.5 sm:h-3.5"/>
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