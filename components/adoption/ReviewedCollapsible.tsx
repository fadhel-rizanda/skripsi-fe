'use client';

import {useEffect, useState} from "react";
import {Adoption, Requirement} from "@/types/adoption";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import RequirementCard from "@/components/card/RequirementCard";
import {requirementServices} from "@/services/adoptionServices";
import {UserProfile} from "@/types";
import {getDotColor, getHeaderBadge, getStageState} from "@/lib/adoption-stage-helpers";
import SetRequirementDialog from "@/components/dialog/SetRequirementDialog";
import {useAdoptionStore} from "@/store/useAdoptionStore";
import {ActionDialog} from "@/components/dialog/ActionDialog";
import {RejectDialog} from "@/components/dialog/RejectDialog";
import {RejectInput} from "@/schemas/adoption.schema";

interface ReviewedCollapsibleProps {
    currentUser?: UserProfile;
    adoption?: Adoption | null;
    onUpload?: (req: Requirement) => void;
}

export default function ReviewedCollapsible({currentUser, adoption}: ReviewedCollapsibleProps) {
    const [requirements, setRequirements] = useState<Requirement[]>([]);
    const [loading, setLoading] = useState(true);

    const currentUserId = currentUser?.id ?? "";

    const reviewTicket = useAdoptionStore((s) => s.reviewTicket);
    const triggerReviewRefresh = useAdoptionStore((s) => s.triggerReviewRefresh);
    const triggerAdoptionRefresh = useAdoptionStore((s) => s.triggerAdoptionRefresh);

    const stageState = getStageState(adoption, "Requirement");
    const dotColor = getDotColor(stageState);
    const headerBadge = getHeaderBadge(stageState, adoption);
    const isReadOnly = stageState === "done" || stageState === "inactive";

    useEffect(() => {
        if (!adoption?.id) return;

        const controller = new AbortController();
        let cancelled = false;

        async function fetchRequirements() {
            try {
                const res = await requirementServices.getRequirementsByAdoptionId(
                    adoption?.id || "",
                    controller.signal
                );
                if (!cancelled) setRequirements(res.data ?? []);
            } catch {
                // aborted or failed
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        fetchRequirements();

        return () => {
            cancelled = true;
            controller.abort();
        };
    }, [adoption?.id, reviewTicket]);

    // ─── Finalize logic ───────────────────────────────────────────────────────
    const myRequirements = requirements.filter((r) => r.created_by?.id === currentUserId);
    const canFinalize =
        !isReadOnly &&
        myRequirements.length > 0 &&
        myRequirements.some((r) => r.is_active) &&
        myRequirements.every((r) => {
            const s = r.status?.name?.toLowerCase() ?? ""
            return s.includes("completed") || s.includes("rejected")
        });

    const canSetRequirements =
        !isReadOnly && (
            myRequirements.length === 0 ||
            myRequirements.every((r) => r.is_active)
        );

    const allFinalized =
        requirements.length > 0 &&
        requirements.every((r) => {
            const s = r.status?.name?.toLowerCase() ?? ""
            return s.includes("completed") || s.includes("rejected")
        });

    // ─── Reject dialog ────────────────────────────────────────────────────────
    const [selectedReq, setSelectedReq] = useState<Requirement | null>(null);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

    const handleReject = async (req: Requirement) => {
        if (isReadOnly) return;
        setSelectedReq(req);
        setRejectDialogOpen(true);
    };

    const handleConfirmReject = async (reason: string) => {
        if (!selectedReq || !adoption?.id) return;
        const data = {notes: reason} as RejectInput;
        await requirementServices.rejectRequirement(adoption.id, selectedReq.id, data);
        triggerReviewRefresh();
    };

    const handleApprove = async (req: Requirement) => {
        if (!adoption?.id || isReadOnly) return;
        await requirementServices.approveRequirement(adoption.id, req.id);
        triggerReviewRefresh();
    };

    // ─── Action dialog (delete / finalize) ───────────────────────────────────
    const [actionDialogOpen, setActionDialogOpen] = useState(false);
    const [actionConfig, setActionConfig] = useState<{
        title: string;
        description: string;
        confirmText: string;
        variant: "default" | "destructive";
        onConfirm: () => Promise<void>;
        onContinue?: () => void;
    } | null>(null);

    const handleDelete = (req: Requirement) => {
        setSelectedReq(req);
        setActionConfig({
            title: "Delete Requirement?",
            description: `Are you sure you want to delete "${req.name}"? This action cannot be undone.`,
            confirmText: "Delete",
            variant: "destructive",
            onConfirm: async () => {
                await requirementServices.deleteRequirementById(adoption!.id, req.id);
            },
            onContinue: () => {
                triggerReviewRefresh();
                setSelectedReq(null);
                setActionConfig(null);
            },
        });
        setActionDialogOpen(true);
    };

    const handleFinalize = () => {
        setActionConfig({
            title: "Finalize Your Requirements?",
            description: allFinalized
                ? "All requirements from both sides are done. This will move the adoption to the next stage."
                : "This will mark your requirements as finalized. The adoption will proceed once the other party also finalizes.",
            confirmText: "Finalize",
            variant: "default",
            onConfirm: async () => {
                await requirementServices.finalizeRequirements(adoption!.id);
            },
            onContinue: () => {
                triggerReviewRefresh();
                if (allFinalized) triggerAdoptionRefresh();
                setActionConfig(null);
            },
        });
        setActionDialogOpen(true);
    };

    const hasRequirements = requirements.length > 0;

    // ─── Skeleton ─────────────────────────────────────────────────────────────
    if (!adoption) {
        return (
            <div className="w-full max-w-4xl border rounded-2xl px-4 py-4 bg-white animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-4 w-4 rounded-full bg-slate-200"/>
                    <div className="h-4 w-40 bg-slate-200 rounded"/>
                </div>
                <div className="h-3 w-3/4 bg-slate-100 rounded mb-4"/>
                <div className="flex flex-col gap-2 border-t border-slate-50 pt-4">
                    {[1, 2].map((i) => (
                        <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                            <div className="h-3 w-1/3 bg-slate-200 rounded mb-2"/>
                            <div className="h-2 w-1/2 bg-slate-100 rounded"/>
                        </div>
                    ))}
                </div>
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
                            <span className="text-sm sm:text-base font-bold text-slate-900 text-left shrink-0">Application Review</span>
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
                        <p className="text-slate-500 mb-4">
                            Our team has reviewed your initial application. To proceed, we require some
                            additional documents. Please upload the following items for our review.
                        </p>

                        {/* Both roles can set requirements + finalize their own */}
                        {!isReadOnly && (
                            <div className="flex gap-2 mb-4">
                                {canSetRequirements && (
                                    <SetRequirementDialog
                                        adoptionId={adoption.id}
                                        onSuccessAction={triggerReviewRefresh}
                                    />
                                )
                                }
                                {canFinalize && (
                                    <Button
                                        className="bg-slate-800 hover:bg-slate-700 text-white rounded-xl h-8 px-3 text-xs font-bold"
                                        onClick={handleFinalize}
                                    >
                                        Finalize My Requirements
                                    </Button>
                                )}
                            </div>
                        )}

                        <div className="border-t border-slate-100 pt-4">
                            <h3 className="font-bold text-sm mb-3 text-slate-900">Required Documents</h3>

                            {loading ? (
                                <div className="flex flex-col gap-2">
                                    {[1, 2].map((i) => (
                                        <div key={i}
                                             className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 animate-pulse">
                                            <div className="h-3 w-1/3 bg-slate-200 rounded mb-2"/>
                                            <div className="h-2 w-1/2 bg-slate-100 rounded"/>
                                        </div>
                                    ))}
                                </div>
                            ) : hasRequirements ? (
                                <div className="flex flex-col gap-2">
                                    {requirements.map((req) => (
                                        <RequirementCard
                                            key={req.id}
                                            requirement={req}
                                            adoptionId={adoption.id}
                                            currentUserId={currentUserId}
                                            onApproveAction={isReadOnly ? undefined : handleApprove}
                                            onRejectAction={isReadOnly ? undefined : handleReject}
                                            onDeleteAction={isReadOnly ? undefined : handleDelete}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                                    <p className="text-xs text-slate-500">
                                        No requirements have been set yet.
                                    </p>
                                </div>
                            )}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            <ActionDialog
                open={actionDialogOpen}
                onOpenChange={setActionDialogOpen}
                onConfirm={actionConfig?.onConfirm || (async () => {
                })}
                onContinue={() => {
                    actionConfig?.onContinue?.();
                    setActionDialogOpen(false);
                }}
                title={actionConfig?.title || ""}
                description={actionConfig?.description || ""}
                confirmText={actionConfig?.confirmText || "Confirm"}
                confirmVariant={actionConfig?.variant || "default"}
                successTitle="Success"
                successDescription="Your action has been completed successfully."
            />
            <RejectDialog
                open={rejectDialogOpen}
                onOpenChange={setRejectDialogOpen}
                onConfirm={handleConfirmReject}
                requirementName={selectedReq?.name || ""}
            />
        </>
    );
}