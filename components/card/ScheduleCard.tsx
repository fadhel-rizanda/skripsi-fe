import {MeetNGreet} from "@/types/adoption";
import {Address, Schedule} from "@/types/general";
import {Badge} from "@/components/ui/badge";
import {CalendarClock, CheckCircle2, Clock, MapPin, Video, LinkIcon, FileText} from "lucide-react";
import {Button} from "@/components/ui/button";
import {ReactNode} from "react";


function formatScheduledTime(isoString: string) {
    const date = new Date(isoString);
    const formattedDate = date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
    const formattedTime = date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
    });
    return {formattedDate, formattedTime};
}

function isOnlineLocation(address: Address): boolean {
    const locationName = [
        address.province?.name,
        address.regency?.name,
        address.district?.name,
    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

    return locationName.includes("online");
}

function formatAddress(address: Address): string {
    const parts = [
        address.street,
        address.district?.name,
        address.regency?.name,
        address.province?.name,
        address.zip_code,
    ];

    return parts.filter(Boolean).join(", ");
}

function didCurrentUserPropose(schedule: Schedule, currentUserId: string): boolean {
    const createdBy = schedule.created_by;
    if (typeof createdBy === "string") return createdBy === currentUserId;
    return createdBy?.id === currentUserId;
}

export default function ScheduleCard({
                                         meetNGreet,
                                         currentUserId,
                                         onAccept,
                                         proposeNewTrigger,
                                     }: {
    meetNGreet: MeetNGreet;
    currentUserId: string;
    onAccept?: () => void;
    proposeNewTrigger?: ReactNode;
}) {
    const schedule = meetNGreet.schedule;
    const statusName = meetNGreet.status?.name ?? "inprogress";
    const isCompleted = statusName === "completed";
    const isApproved = meetNGreet.adopter_confirmed && meetNGreet.provider_confirmed;

    const {formattedDate, formattedTime} = formatScheduledTime(schedule.scheduled_time);
    const address = schedule.address as unknown as Address;
    const formattedAddr = address ? formatAddress(address) : "-";
    const isOnline = address ? isOnlineLocation(address) : false;

    const userProposedLast = didCurrentUserPropose(schedule, currentUserId);

    const bgColor = isCompleted || isApproved
        ? (isOnline ? "bg-indigo-50 border border-indigo-200" : "bg-slate-50 border border-slate-200")
        : (isOnline ? "bg-indigo-50 border border-indigo-200" : "bg-yellow-50 border border-yellow-200");

    return (
        <div className={`${bgColor} rounded-xl px-4 py-3 flex flex-col gap-3`}>
            {/* Status label */}
            <div className="flex items-center gap-2 flex-wrap">
                {isCompleted ? (
                    <Badge
                        variant="outline"
                        className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700 border-green-200"
                    >
                        <CheckCircle2 className="h-3 w-3" />
                        Completed
                    </Badge>
                ) : isApproved ? (
                    <Badge
                        variant="outline"
                        className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700 border-blue-200"
                    >
                        <CheckCircle2 className="h-3 w-3" />
                        Schedule Approved
                    </Badge>
                ) : (
                    <Badge
                        variant="outline"
                        className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-yellow-100 text-yellow-700 border-yellow-200"
                    >
                        <CalendarClock className="h-3 w-3" />
                        Scheduling in Progress
                    </Badge>
                )}
                {isOnline && (
                    <Badge
                        variant="outline"
                        className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-indigo-100 text-indigo-700 border-indigo-200"
                    >
                        <Video className="h-3 w-3" />
                        Online Meeting
                    </Badge>
                )}
            </div>

            {/* Schedule details */}
            <div className="flex flex-col gap-2">
                {/* Date */}
                <div className="flex items-center gap-2 text-xs text-slate-700">
                    <CalendarClock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>
                        <span className="font-medium">Proposed Date:</span> {formattedDate}
                    </span>
                </div>

                {/* Time */}
                <div className="flex items-center gap-2 text-xs text-slate-700">
                    <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>
                        <span className="font-medium">Proposed Time:</span> {formattedTime}
                    </span>
                </div>

                {/* Location / Online Meeting */}
                {isOnline ? (
                    <div className="flex items-start gap-2 text-xs text-slate-700">
                        <Video className="h-3.5 w-3.5 text-indigo-500 shrink-0 mt-0.5" />
                        <div className="flex flex-col gap-1.5 flex-1">
                            <span>
                                <span className="font-medium">Meeting Type:</span> Online Meeting
                            </span>
                            {address?.link && (
                                <a
                                    href={address.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 underline font-medium w-fit"
                                >
                                    <LinkIcon className="h-3 w-3" />
                                    Join Meeting
                                </a>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex items-start gap-2 text-xs text-slate-700">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="flex-1">
                            <span className="font-medium">Location:</span>{" "}
                            {address?.link ? (
                                <a
                                    href={address.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 underline hover:text-blue-600"
                                >
                                    {formattedAddr}
                                </a>
                            ) : (
                                formattedAddr
                            )}
                        </span>
                    </div>
                )}

                {/* Notes - untuk kedua tipe meeting */}
                {address?.notes && (
                    <div className="flex items-start gap-2 text-xs text-slate-700 bg-slate-100 rounded-lg p-2.5">
                        <FileText className="h-3.5 w-3.5 text-slate-500 shrink-0 mt-0.5" />
                        <div className="flex flex-col gap-0.5 flex-1">
                            <span className="font-medium text-slate-600">Additional Notes:</span>
                            <span className="text-slate-600 leading-relaxed">{address.notes}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Confirmation Status - untuk context tambahan */}
            {!isCompleted && (
                <div className="flex items-center gap-4 text-xs border-t border-slate-200 pt-2.5">
                    <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${meetNGreet.adopter_confirmed ? "bg-green-500" : "bg-slate-300"}`} />
                        <span className="text-slate-600">
                            Adopter: <span className="font-medium">{meetNGreet.adopter_confirmed ? "Confirmed" : "Pending"}</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${meetNGreet.provider_confirmed ? "bg-green-500" : "bg-slate-300"}`} />
                        <span className="text-slate-600">
                            Provider: <span className="font-medium">{meetNGreet.provider_confirmed ? "Confirmed" : "Pending"}</span>
                        </span>
                    </div>
                </div>
            )}

            {/* Action buttons — only visible when not yet completed/approved */}
            {!isCompleted && !isApproved && (
                <div className="flex flex-wrap gap-2 pt-1">
                    {!userProposedLast && (
                        <Button
                            className="bg-[#19E619] hover:bg-green-500 text-black rounded-xl h-8 px-3 text-xs font-bold gap-1.5"
                            onClick={onAccept}
                        >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Accept Proposal
                        </Button>
                    )}
                    {proposeNewTrigger}
                </div>
            )}
        </div>
    );
}