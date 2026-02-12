"use client";

import {Adoption} from "@/types/adoption";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {Icon} from "@iconify/react";
import {isValidUrl} from "@/lib/utils";
import Image from "next/image";

interface AdoptionCardProps {
    adoption: Adoption;
}

export function AdoptionCard({adoption}: AdoptionCardProps) {
    return (
        <Card
            className="group w-full hover:shadow-lg transition-all duration-300 border-gray-200 overflow-hidden p-0 gap-0">
            {/* Header */}
            <div className="bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 border-b border-gray-100">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-xl shadow-sm">
                            <Icon icon="lucide:paw-print" className="w-5 h-5"/>
                        </div>
                        <div>
                            <div className="text-lg flex items-center gap-1">
                                <span className="font-semibold">{adoption.pet.name}</span> - <span
                                className="font-light text-sm">{adoption.pet.id}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-0.5">
                                Adoption ID: {adoption.id}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-end gap-2">
                        <Badge
                            variant="outline"
                            className={`font-medium ${adoption.stage_tag.color_code ?? ""}`}
                        >
                            {adoption.stage_tag.name}
                        </Badge>
                        <Badge
                            variant="outline"
                            className={`font-medium ${adoption.status.color_code ?? ""}`}
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
                        <div
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                            <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                                {adoption.provider.avatar && isValidUrl(adoption.provider.avatar) ? (
                                    <Image
                                        src={adoption.provider.avatar}
                                        alt={adoption.provider.name || "Provider Avatar"}
                                        fill
                                        priority
                                        className="rounded-full object-cover"
                                        sizes="32px"
                                        onError={(e) => {
                                            console.error("Image failed to load:", adoption.provider.avatar);
                                        }}
                                    />
                                ) : (
                                    <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold">
                                        {adoption.provider.name.charAt(0).toUpperCase() || "P"}
                                    </AvatarFallback>
                                )}
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">
                                    {adoption.provider.name}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    {adoption.provider.email}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Adopter */}
                    <div className="space-y-3">
                        <div
                            className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                            <Icon icon="lucide:user-heart" className="w-3.5 h-3.5"/>
                            <Icon icon="lucide:user" className="w-3.5 h-3.5"/>
                            Adopter
                        </div>
                        <div
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                            <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                                {adoption.adopter.avatar && isValidUrl(adoption.adopter.avatar) ? (
                                    <Image
                                        src={adoption.adopter.avatar}
                                        alt={adoption.adopter.name || "Adopter Avatar"}
                                        fill
                                        priority
                                        className="rounded-full object-cover"
                                        sizes="32px"
                                        onError={(e) => {
                                            console.error("Image failed to load:", adoption.adopter.avatar);
                                        }}
                                    />
                                ) : (
                                    <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold">
                                        {adoption.adopter.name.charAt(0).toUpperCase() || "A"}
                                    </AvatarFallback>
                                )}
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">
                                    {adoption.adopter.name}
                                </p>
                                <a
                                    href={`mailto:${adoption.adopter.email}`}
                                    className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 hover:underline transition-colors"
                                >
                                    <Icon icon="lucide:mail" className="w-3 h-3"/>
                                    {adoption.adopter.email}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 pb-6 pt-4 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
                    <Icon icon="lucide:calendar" className="w-3.5 h-3.5"/>
                    <span>Created {new Date(adoption.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    })}</span>
                </div>
            </CardContent>
        </Card>
    );
}