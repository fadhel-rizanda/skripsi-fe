'use client';

import {useEffect, useState} from "react";
import {Adoption, Handover} from "@/types/adoption";
import {UserProfile} from "@/types";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import {Badge} from "@/components/ui/badge";
import ScheduleCard from "@/components/card/ScheduleCard";
import ConfirmHandoverSection from "@/components/adoption/ConfirmHandoverSection";
import {handoverServices} from "@/services/adoptionServices";
import {getDotColor, getHeaderBadge, getStageState} from "@/lib/adoption-stage-helpers";
import {useAdoptionStore} from "@/store/useAdoptionStore";
import {ActionDialog} from "@/components/dialog/ActionDialog";
import {CreateHandoverDialog} from "@/components/dialog/CreateHandoverDialog";
import {Button} from "@/components/ui/button";
import {CalendarClock} from "lucide-react";

interface HandoverCollapsibleProps {
    currentUser?: UserProfile;
    adoption?: Adoption | null;
}

export default function HandoverCollapsible({
                                                currentUser,
                                                adoption,
                                            }: HandoverCollapsibleProps) {
    const [handover, setHandover] = useState<Handover | null>(null);
    const [loading, setLoading] = useState(true);

    const currentUserId = currentUser?.id ?? "";
    const role = currentUser?.role?.name;

    const handoverTicket = useAdoptionStore((s) => s.handoverTicket);
    const triggerHandoverRefresh = useAdoptionStore((s) => s.triggerHandoverRefresh);
    const triggerAdoptionRefresh = useAdoptionStore((s) => s.triggerAdoptionRefresh);

    const stageState = getStageState(adoption, "Handover");
    const dotColor = getDotColor(stageState);
    const headerBadge = getHeaderBadge(stageState, adoption);
    const isReadOnly = stageState === "done" || stageState === "inactive";

    const meetNGreet = handover?.meet_n_greet;
    const hasSchedule = !!meetNGreet?.schedule;

    useEffect(() => {
        if (!adoption?.id) return;

        const controller = new AbortController();
        let cancelled = false;

        async function fetchHandover() {
            try {
                const res = await handoverServices.getHandover(adoption?.id || "", controller.signal);
                if (!cancelled) setHandover(res.data ?? null);
            } catch {
                // aborted or failed
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        fetchHandover();

        return () => {
            cancelled = true;
            controller.abort();
        };
    }, [adoption?.id, handoverTicket]);

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
        onConfirm: async () => {},
    });

    const openDialog = (config: Omit<typeof dialogConfig, "open">) => {
        setDialogConfig({open: true, ...config});
    };

    const handleAcceptSchedule = () => {
        openDialog({
            title: "Accept Handover Schedule?",
            description: "You're confirming this handover schedule.",
            confirmText: "Accept",
            successTitle: "Schedule Accepted!",
            successDescription: "The other party will be notified.",
            onConfirm: async () => {
                if (!adoption?.id || !handover?.id) return;
                await handoverServices.approveHandover(adoption.id, handover.id);
                triggerHandoverRefresh();
            },
        });
    };

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
                            <span className="text-sm sm:text-base font-bold text-slate-900 text-left shrink-0">Handover Day</span>
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
                        {role === "provider" && !handover && !loading && !isReadOnly && (
                            <div className="mb-4">
                                <CreateHandoverDialog
                                    adoptionId={adoption.id}
                                    onSuccessAction={triggerHandoverRefresh}
                                />
                            </div>
                        )}

                        {loading ? (
                            <div className="flex flex-col gap-3 animate-pulse">
                                <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-6">
                                    <div className="h-3 w-1/3 bg-slate-200 rounded mb-3"/>
                                    <div className="h-2 w-1/2 bg-slate-100 rounded mb-2"/>
                                    <div className="h-2 w-2/5 bg-slate-100 rounded"/>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {hasSchedule && meetNGreet && (
                                    <ScheduleCard
                                        meetNGreet={meetNGreet}
                                        currentUserId={currentUserId}
                                        onAccept={isReadOnly ? undefined : handleAcceptSchedule}
                                        proposeNewTrigger={
                                            !isReadOnly ? (
                                                <CreateHandoverDialog
                                                    adoptionId={adoption.id}
                                                    handoverId={handover?.id}
                                                    onSuccessAction={triggerHandoverRefresh}
                                                    trigger={
                                                        <Button variant="outline"
                                                                className="rounded-xl h-8 px-3 text-xs font-bold gap-1.5 border-slate-300 text-slate-700 hover:bg-slate-100">
                                                            <CalendarClock className="h-3.5 w-3.5"/>
                                                            Propose New Time/Location
                                                        </Button>
                                                    }
                                                />
                                            ) : undefined
                                        }
                                    />
                                )}

                                <div className="border-t border-slate-100 pt-3">
                                    {handover ? (
                                        <ConfirmHandoverSection
                                            currentUser={currentUser}
                                            adoptionId={adoption.id}
                                            handover={handover}
                                            role={role}
                                            onConfirmChange={isReadOnly ? undefined : () => {
                                                triggerHandoverRefresh();
                                                triggerAdoptionRefresh();
                                            }}
                                        />
                                    ) : (
                                        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                                            <p className="text-xs text-slate-500">
                                                Handover has not been initiated yet.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
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