'use client';

import {useEffect, useState} from "react";
import {Adoption, MeetNGreet} from "@/types/adoption";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import ScheduleCard from "@/components/card/ScheduleCard";
import {meetNGreetServices} from "@/services/adoptionServices";
import {UserProfile} from "@/types";
import {getDotColor, getHeaderBadge, getStageState} from "@/lib/adoption-stage-helpers";
import {useAdoptionStore} from "@/store/useAdoptionStore";
import {CreateMeetNGreetDialog} from "@/components/dialog/CreateMeetNGreetDialog";
import {ActionDialog} from "@/components/dialog/ActionDialog";
import {CalendarClock} from "lucide-react";

interface MeetNGreetCollapsibleProps {
    currentUser?: UserProfile;
    adoption?: Adoption | null;
}

export default function MeetNGreetCollapsible({
                                                  currentUser,
                                                  adoption,
                                              }: MeetNGreetCollapsibleProps) {
    const [meetNGreet, setMeetNGreet] = useState<MeetNGreet | null>(null);
    const [loading, setLoading] = useState(true);

    const currentUserId = currentUser?.id ?? "";
    const role = currentUser?.role?.name === "adopter" ? "adopter" : "provider";

    const meetNGreetTicket = useAdoptionStore((s) => s.meetNGreetTicket);
    const triggerMeetNGreetRefresh = useAdoptionStore((s) => s.triggerMeetNGreetRefresh);
    const triggerAdoptionRefresh = useAdoptionStore((s) => s.triggerAdoptionRefresh);

    const stageState = getStageState(adoption, "Meet & Greet");
    const dotColor = getDotColor(stageState);
    const headerBadge = getHeaderBadge(stageState, adoption);
    const isReadOnly = stageState === "done" || stageState === "inactive";

    useEffect(() => {
        if (!adoption?.id) return;

        const controller = new AbortController();
        let cancelled = false;

        async function fetchMeetNGreet() {
            try {
                const res = await meetNGreetServices.getMeetNGreet(adoption?.id || "", controller.signal);
                if (!cancelled) setMeetNGreet(res.data ?? null);
            } catch {
                // aborted or failed
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        fetchMeetNGreet();

        return () => {
            cancelled = true;
            controller.abort();
        };
    }, [adoption?.id, meetNGreetTicket]);

    const [dialogConfig, setDialogConfig] = useState<{
        open: boolean;
        title: string;
        description: string;
        confirmText: string;
        successTitle: string;
        successDescription: string;
        onConfirm: () => Promise<void>;
    }>({
        open: false,
        title: "",
        description: "",
        confirmText: "",
        successTitle: "",
        successDescription: "",
        onConfirm: async () => {
        },
    })

    const openDialog = (config: Omit<typeof dialogConfig, "open">) => {
        setDialogConfig({open: true, ...config})
    }

    const handleAccept = () => {
        openDialog({
            title: "Accept Proposal?",
            description: "You're confirming this meet & greet schedule.",
            confirmText: "Accept",
            successTitle: "Schedule Accepted!",
            successDescription: "The other party will be notified.",
            onConfirm: async () => {
                if (!adoption?.id || !meetNGreet?.id) return
                await meetNGreetServices.approveMeetNGreet(adoption.id, meetNGreet.id)
                triggerMeetNGreetRefresh()
            }
        })
    }

    const handleFinalize = () => {
        openDialog({
            title: "Finalize Meet & Greet?",
            description: "This will mark the meet & greet as completed.",
            confirmText: "Finalize",
            successTitle: "Meet & Greet Finalized!",
            successDescription: "The adoption will proceed to the next stage.",
            onConfirm: async () => {
                if (!adoption?.id || !meetNGreet?.id) return
                await meetNGreetServices.finalizeMeetNGreet(adoption.id, meetNGreet.id)
                triggerMeetNGreetRefresh()
                triggerAdoptionRefresh()
            }
        })
    }

    const hasSchedule = !!meetNGreet?.schedule;
    const isCompleted = meetNGreet?.status?.name?.toLowerCase().includes("completed") ?? false;
    const bothConfirmed = meetNGreet?.adopter_confirmed && meetNGreet?.provider_confirmed;

    if (!adoption) {
        return (
            <div className="w-full max-w-4xl border rounded-2xl px-4 py-4 bg-white animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-4 w-4 rounded-full bg-slate-200"/>
                    <div className="h-4 w-32 bg-slate-200 rounded"/>
                </div>
                <div className="h-20 bg-slate-50 border border-slate-100 rounded-xl"/>
            </div>
        );
    }

    return (
        <>
            <Accordion
                type="single"
                collapsible
                defaultValue="item-1"
                className={`w-full max-w-4xl border rounded-xl sm:rounded-2xl px-3 sm:px-4 bg-white transition-opacity ${
                    stageState === "inactive" ? "opacity-50 pointer-events-none" : ""
                }`}
            >
                <AccordionItem value="item-1" className="border-none">
                    <AccordionTrigger className="hover:no-underline py-2.5 sm:py-3">
                        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                            <div className={`h-3 w-3 sm:h-4 sm:w-4 rounded-full ${dotColor} shrink-0`}/>
                            <span className="text-sm sm:text-base font-bold text-slate-900 text-left shrink-0">Meet &amp; Greet</span>
                            {headerBadge && (
                                <Badge
                                    variant="outline"
                                    className={`flex items-center gap-1 text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-medium border ${headerBadge.className}`}
                                >
                                    {headerBadge.label}
                                </Badge>
                            )}
                        </div>
                    </AccordionTrigger>

                    <AccordionContent className="pt-0 pb-3 sm:pb-4 text-xs sm:text-sm">
                        {role === "provider" && !hasSchedule && !loading && !isReadOnly && (
                            <div className="mb-4">
                                <CreateMeetNGreetDialog existing={adoption.meet_n_greet} adoptionId={adoption.id}/>
                            </div>
                        )}

                        <div className="border-t border-slate-100 pt-3 sm:pt-4 flex flex-col gap-2 sm:gap-3">
                            {loading ? (
                                <div className="bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl px-3 sm:px-4 py-4 sm:py-6 animate-pulse">
                                    <div className="h-2 sm:h-3 w-1/3 bg-slate-200 rounded mb-2 sm:mb-3"/>
                                    <div className="h-2 w-1/2 bg-slate-100 rounded mb-2"/>
                                    <div className="h-2 w-2/5 bg-slate-100 rounded"/>
                                </div>
                            ) : hasSchedule && meetNGreet ? (
                                <>
                                    <ScheduleCard
                                        meetNGreet={meetNGreet}
                                        currentUserId={currentUserId}
                                        onAccept={isReadOnly ? undefined : handleAccept}
                                        proposeNewTrigger={
                                            !isReadOnly ? (
                                                <CreateMeetNGreetDialog
                                                    adoptionId={adoption.id}
                                                    existing={meetNGreet}
                                                    onSuccessAction={triggerMeetNGreetRefresh}
                                                    trigger={
                                                        <Button variant="outline"
                                                                className="rounded-lg sm:rounded-xl h-8 px-2 sm:px-3 text-[10px] sm:text-xs font-bold gap-1 sm:gap-1.5 border-slate-300 text-slate-700 hover:bg-slate-100">
                                                            <CalendarClock className="h-3.5 w-3.5"/>
                                                            Propose New Time/Location
                                                        </Button>
                                                    }
                                                />
                                            ) : undefined
                                        }
                                    />
                                    {role === "provider" && bothConfirmed && !isCompleted && !isReadOnly && new Date(meetNGreet.schedule.scheduled_time) <= new Date() && (
                                        <div className="flex justify-end">
                                            <Button
                                                className="bg-slate-800 hover:bg-slate-700 text-white rounded-xl h-8 px-3 text-xs font-bold"
                                                onClick={handleFinalize}
                                            >
                                                Finalize Meet &amp; Greet
                                            </Button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl px-3 sm:px-4 py-3">
                                    <p className="text-[10px] sm:text-xs text-slate-500">
                                        No schedule has been proposed yet.
                                    </p>
                                </div>
                            )}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
            <ActionDialog
                open={dialogConfig.open}
                onOpenChange={(open) => setDialogConfig(prev => ({...prev, open}))}
                onConfirm={dialogConfig.onConfirm}
                onContinue={() => setDialogConfig(prev => ({...prev, open: false}))}
                title={dialogConfig.title}
                description={dialogConfig.description}
                confirmText={dialogConfig.confirmText}
                successTitle={dialogConfig.successTitle}
                successDescription={dialogConfig.successDescription}
            />
        </>
    );
}