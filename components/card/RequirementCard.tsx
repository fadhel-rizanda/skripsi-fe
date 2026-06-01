'use client';

import {ChangeEvent, ReactNode, useRef, useState} from "react";
import {Requirement} from "@/types/adoption";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {
    AlertCircle, CheckCircle2, Clock, Edit3,
    FileText, Loader2, ThumbsDown, ThumbsUp, Trash2, Upload, XCircle,
} from "lucide-react";
import {openAttachment, uploadAttachment} from "@/lib/attachment-helpers";
import {requirementServices} from "@/services/adoptionServices";
import {toast} from "sonner";
import {useAdoptionStore} from "@/store/useAdoptionStore";
import {Attachment} from "@/types/attachment";
import UpdateRequirementDialog from "@/components/dialog/UpdateRequirementDialog";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStatusIcon(name: string): ReactNode {
    const lower = name.toLowerCase();
    if (lower.includes("completed") || lower.includes("accepted")) return <CheckCircle2 className="h-3 w-3"/>;
    if (lower.includes("rejected") || lower.includes("declined") || lower.includes("cancelled")) return <XCircle className="h-3 w-3"/>;
    if (lower.includes("progress")) return <Clock className="h-3 w-3"/>;
    return <AlertCircle className="h-3 w-3"/>;
}

function getFileIcon(name: string): ReactNode {
    const lower = name.toLowerCase();
    if (lower.includes("completed")) return <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0"/>;
    if (lower.includes("rejected")) return <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0"/>;
    return <FileText className="h-3.5 w-3.5 text-slate-400 shrink-0"/>;
}

function getFileTextColor(name: string): string {
    const lower = name.toLowerCase();
    if (lower.includes("completed")) return "text-green-600";
    if (lower.includes("rejected")) return "text-red-500";
    return "text-blue-500";
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function RequirementCard({
                                            requirement,
                                            adoptionId,
                                            currentUserId,
                                            onApproveAction,
                                            onRejectAction,
                                            onDeleteAction,
                                            isDisabled = false,
                                        }: {
    requirement: Requirement;
    adoptionId: string;
    currentUserId: string;
    onApproveAction?: (req: Requirement) => void;
    onRejectAction?: (req: Requirement) => void;
    onDeleteAction?: (req: Requirement) => void;
    isDisabled?: boolean;
}) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const triggerAdoptionRefresh = useAdoptionStore((s) => s.triggerAdoptionRefresh);

    const statusName = requirement.status?.name ?? "Pending";
    const statusColorClass = requirement.status?.color_code ?? "bg-yellow-50 text-yellow-700 border-yellow-200";
    const lower = statusName.toLowerCase();
    const hasFile = !!requirement.attachment?.filename;

    const isCompleted = lower.includes("completed") || lower.includes("rejected");
    const isRejected = lower.includes("rejected");
    const isInProgress = lower.includes("progress");

    const isMine = requirement.created_by?.id === currentUserId;
    const isFiller = !isMine;

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = "";
        setUploading(true);
        try {
            const attachmentId = await uploadAttachment(file);
            await requirementServices.fillRequirement(adoptionId, requirement.id, attachmentId);
            toast.success("File uploaded successfully.");
            triggerAdoptionRefresh();
        } catch (e) {
            toast.error("Failed to upload file. Please try again.");
            console.error(e);
        } finally {
            setUploading(false);
        }
    };

    const triggerFileInput = () => fileInputRef.current?.click();

    const handleDownload = async (attachment: Attachment) => {
        try {
            toast.info("Preparing download...");
            await openAttachment(attachment);
        } catch (error: unknown) {
            console.error("Download failed:", error);
            type ErrorWithResponse = {response?: {status?: number}};
            if (
                typeof error === "object" &&
                error !== null &&
                "response" in error &&
                (error as ErrorWithResponse).response?.status === 403
            ) {
                toast.error("Access denied. You do not have permission to download this file.");
            } else {
                toast.error("Failed to download file.");
            }
        }
    };

    return (
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex items-center justify-between gap-4">
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange}/>

            {/* Left: info */}
            <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-slate-900">{requirement.name}</span>
                    <Badge
                        variant="outline"
                        className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium border ${statusColorClass}`}
                    >
                        {getStatusIcon(statusName)}
                        {statusName}
                    </Badge>
                    {/* Show who set this requirement */}
                    <span className="text-xs text-slate-400">
                        {isMine ? "Set by you" : `Set by ${requirement.created_by?.name ?? "other party"}`}
                    </span>
                </div>

                {requirement.notes && (
                    <p className="text-xs text-slate-500">{requirement.notes}</p>
                )}

                {hasFile && (
                    <button
                        type="button"
                        className="flex items-center gap-1 mt-0.5 cursor-pointer hover:underline"
                        onClick={() => handleDownload(requirement.attachment!)}
                    >
                        {getFileIcon(statusName)}
                        <span className={`text-xs truncate ${getFileTextColor(statusName)}`}>
                            {requirement.attachment?.filename}
                        </span>
                    </button>
                )}
            </div>

            {/* Right: actions */}
            <div className="shrink-0 flex items-center gap-1">

                {/* ── Upload actions: shown to the filler (the other party) ── */}
                {isFiller && (
                    <>
                        {isCompleted ? (
                            <Button
                                variant="secondary"
                                className="rounded-xl h-8 px-3 text-xs font-bold gap-1.5 bg-slate-200 text-slate-600 cursor-default"
                                disabled
                            >
                                <Upload className="h-3.5 w-3.5"/>
                                Uploaded
                            </Button>
                        ) : isRejected ? (
                            <Button
                                className="bg-[#19E619] hover:bg-green-500 text-black rounded-xl h-8 px-3 text-xs font-bold gap-1.5"
                                onClick={triggerFileInput}
                                disabled={uploading || isDisabled}
                            >
                                {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin"/> : <Upload className="h-3.5 w-3.5"/>}
                                {uploading ? "Uploading..." : "Reupload"}
                            </Button>
                        ) : isInProgress ? (
                            <Button
                                variant="secondary"
                                className="rounded-xl h-8 px-3 text-xs font-bold gap-1.5 bg-slate-200 text-slate-500 cursor-default"
                                disabled
                            >
                                <Clock className="h-3.5 w-3.5"/>
                                Waiting Review
                            </Button>
                        ) : (
                            <Button
                                className="bg-[#19E619] hover:bg-green-500 text-black rounded-xl h-8 px-3 text-xs font-bold gap-1.5"
                                onClick={triggerFileInput}
                                disabled={uploading || isDisabled}
                            >
                                {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin"/> : <Upload className="h-3.5 w-3.5"/>}
                                {uploading ? "Uploading..." : "Upload"}
                            </Button>
                        )}
                    </>
                )}

                {/* ── Review actions: shown to the creator (isMine) ── */}
                {isMine && (
                    <div className="flex items-center gap-1 border-l pl-2 ml-1 border-slate-200">
                        <button
                            onClick={() => onApproveAction?.(requirement)}
                            disabled={!hasFile || isCompleted}
                            title="Approve document"
                            className={`p-1.5 rounded-lg transition-colors ${
                                isCompleted ? "text-green-500" : "text-slate-400 hover:text-green-500 hover:bg-green-50"
                            } ${(!hasFile || isCompleted) ? "opacity-30 cursor-not-allowed" : ""}`}
                        >
                            <ThumbsUp className="h-4 w-4"/>
                        </button>

                        <button
                            onClick={() => onRejectAction?.(requirement)}
                            disabled={!hasFile || isCompleted}
                            title="Reject document"
                            className={`p-1.5 rounded-lg transition-colors ${
                                isRejected ? "text-red-500" : "text-slate-400 hover:text-red-500 hover:bg-red-50"
                            } ${(!hasFile || isCompleted) ? "opacity-30 cursor-not-allowed" : ""}`}
                        >
                            <ThumbsDown className="h-4 w-4"/>
                        </button>

                        {!isCompleted && !isDisabled && (
                            <UpdateRequirementDialog
                                adoptionId={adoptionId}
                                requirement={requirement}
                                onSuccessAction={triggerAdoptionRefresh}
                                trigger={
                                    <button className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-colors">
                                        <Edit3 className="h-4 w-4"/>
                                    </button>
                                }
                            />
                        )}

                        {!isCompleted && !hasFile && !isDisabled && (
                            <button
                                onClick={() => onDeleteAction?.(requirement)}
                                title="Delete requirement"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <Trash2 className="h-4 w-4"/>
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}