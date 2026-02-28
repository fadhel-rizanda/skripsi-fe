'use client';

import {ChangeEvent, useRef, useState} from "react";
import {Handover} from "@/types/adoption";
import {Button} from "@/components/ui/button";
import {CheckCircle2, Clock, FileText, Loader2, Upload} from "lucide-react";
import {uploadAttachment, openAttachment} from "@/lib/attachment-helpers";
import {handoverServices} from "@/services/adoptionServices";
import {useAdoptionStore} from "@/store/useAdoptionStore";
import {toast} from "sonner";
import {ActionDialog} from "@/components/dialog/ActionDialog";
import {Attachment} from "@/types/attachment";
import {UserProfile} from "@/types";

interface ConfirmHandoverSectionProps {
    currentUser?: UserProfile;
    adoptionId: string;
    handover: Handover;
    role?: string;
    onConfirmChange?: () => void;
}

export default function ConfirmHandoverSection({
                                                   currentUser,
                                                   adoptionId,
                                                   handover,
                                                   role,
                                                   onConfirmChange,
                                               }: ConfirmHandoverSectionProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const triggerHandoverRefresh = useAdoptionStore((s) => s.triggerHandoverRefresh);

    const adopterFinalized = handover.adopter_finalized;
    const providerFinalized = handover.provider_finalized;
    const attachments: Attachment[] = handover.attachments ?? [];
    const hasEvidence = attachments.length > 0;

    const isChecked = role === "adopter" ? adopterFinalized : providerFinalized;

    const scheduledTime = handover.meet_n_greet?.schedule?.scheduled_time;
    const isScheduleTimePassed = scheduledTime ? new Date(scheduledTime) <= new Date() : false;

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        if (!files.length) return;
        e.target.value = "";

        setUploading(true);
        try {
            const attachmentIds = await Promise.all(files.map((file) => uploadAttachment(file)));
            await handoverServices.setHandoverEvidence(adoptionId, handover.id, attachmentIds);
            toast.success("Evidence uploaded successfully.");
            triggerHandoverRefresh();
        } catch {
            toast.error("Failed to upload evidence. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const handleFinalize = async () => {
        if (!hasMyEvidence && role !== "admin") {
            toast.error("You must upload at least one evidence file before confirming.");
            return;
        }

        try {
            await handoverServices.finalizeHandover(adoptionId, handover.id);
            toast.success("Handover confirmed.");
            onConfirmChange?.();
            triggerHandoverRefresh();
        } catch {
            toast.error("Failed to confirm handover. Please try again.");
        }
    };

    const handleDownload = async (attachment: Attachment) => {
        try {
            await openAttachment(attachment);
        } catch {
            toast.error("Failed to open attachment.");
        }
    };

    const myAttachments = attachments.filter(
        (att) => att.uploaded_by === currentUser?.id
    );

    const hasMyEvidence = myAttachments.length > 0;

    if (!isScheduleTimePassed) {
        return (
            <div className="flex flex-col gap-3 mt-2">
                <div>
                    <h3 className="font-bold text-sm text-slate-900">Confirm Handover</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Upload proof of handover and confirm. Both the adopter and the provider need to confirm.
                    </p>
                </div>
                <div className="border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2 py-8 px-4 bg-slate-50">
                    <Clock className="h-7 w-7 text-slate-400"/>
                    <p className="text-xs text-slate-500 text-center font-medium">
                        Handover confirmation will be available after the scheduled meeting time.
                    </p>
                    {scheduledTime && (
                        <p className="text-xs text-slate-400">
                            {new Date(scheduledTime).toLocaleDateString("en-US", {
                                month: "long", day: "numeric", year: "numeric",
                            })}{" "}
                            at{" "}
                            {new Date(scheduledTime).toLocaleTimeString("en-US", {
                                hour: "2-digit", minute: "2-digit",
                            })}
                        </p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3 mt-2">
            <div>
                <h3 className="font-bold text-sm text-slate-900">Confirm Handover</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                    Upload proof of handover and confirm. Both the adopter and the provider need to confirm.
                </p>
            </div>

            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileChange}/>

            <div className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 py-6 px-4 transition-colors ${
                hasEvidence ? "border-green-300 bg-green-50" : "border-slate-200 bg-slate-50"
            }`}>
                {hasEvidence ? (
                    <>
                        <CheckCircle2 className="h-7 w-7 text-green-500"/>
                        <p className="text-xs text-green-700 font-medium">
                            {attachments.length} file{attachments.length > 1 ? "s" : ""} uploaded
                        </p>

                        <div className="flex flex-wrap gap-1.5 mt-1 justify-center">
                            {attachments.map((att) => (
                                (att.uploaded_by === currentUser?.id || currentUser?.role?.name === "admin") ? (
                                    <button
                                        key={att.id}
                                        onClick={() => handleDownload(att)}
                                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-green-200 hover:border-green-400 hover:bg-green-50 transition-colors"
                                    >
                                        <FileText className="h-3 w-3 text-green-600 shrink-0"/>
                                        <span className="text-xs text-green-700 font-medium max-w-30 truncate">{att.filename}</span>
                                    </button>
                                ) : (
                                    <div key={att.id} className="flex items-center gap-2 rounded-xl h-8 px-3 text-xs font-bold text-slate-500 bg-slate-100">
                                        <FileText className="h-3.5 w-3.5 text-slate-400"/>
                                        {att.filename}
                                    </div>
                                )
                            ))}
                        </div>

                        {!isChecked && (
                            <Button
                                variant="outline"
                                className="rounded-xl h-8 px-3 text-xs font-bold gap-1.5 border-slate-300 mt-1"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                            >
                                {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin"/> : <Upload className="h-3.5 w-3.5"/>}
                                {uploading ? "Uploading..." : "Add / Replace Files"}
                            </Button>
                        )}
                    </>
                ) : (
                    <>
                        <Upload className="h-7 w-7 text-slate-400"/>
                        <p className="text-xs text-slate-500 text-center">
                            Drag &amp; drop a photo of the pet with the new owner or a signed agreement.
                        </p>
                        <Button
                            className="bg-[#19E619] hover:bg-green-500 text-black rounded-xl h-8 px-4 text-xs font-bold gap-1.5"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                        >
                            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin"/> : <Upload className="h-3.5 w-3.5"/>}
                            {uploading ? "Uploading..." : "Browse Files"}
                        </Button>
                    </>
                )}
            </div>

            {/* Confirmation cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 flex flex-col gap-2">
                    <span className="text-xs font-bold text-slate-900">Adopter Confirmation</span>
                    <label className={`flex items-start gap-2 ${role === "adopter" && hasEvidence && !adopterFinalized ? "cursor-pointer" : "cursor-default"}`}>
                        <input
                            type="checkbox"
                            checked={adopterFinalized}
                            disabled={role !== "adopter" || !hasMyEvidence || adopterFinalized}
                            onChange={role === "adopter" && !adopterFinalized ? () => setDialogOpen(true) : undefined}
                            className="mt-0.5 accent-[#19E619] h-3.5 w-3.5 shrink-0"
                        />
                        <span className="text-xs text-slate-600">I confirm the handover is complete.</span>
                    </label>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 flex flex-col gap-2">
                    <span className="text-xs font-bold text-slate-900">Provider Confirmation</span>
                    <label className={`flex items-start gap-2 ${role === "provider" && hasEvidence && !providerFinalized ? "cursor-pointer" : "cursor-default"}`}>
                        <input
                            type="checkbox"
                            checked={providerFinalized}
                            disabled={role !== "provider" || !hasMyEvidence || providerFinalized}
                            onChange={role === "provider" && !providerFinalized ? () => setDialogOpen(true) : undefined}
                            className="mt-0.5 accent-[#19E619] h-3.5 w-3.5 shrink-0"
                        />
                        <span className="text-xs text-slate-600">I confirm the handover is complete.</span>
                    </label>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 flex flex-col gap-2">
                    <span className="text-xs font-bold text-slate-900">Admin Confirmation</span>
                    <label className={`flex items-start gap-2 ${currentUser?.role?.name === "admin" && hasEvidence && !handover.admin_finalized ? "cursor-pointer" : "cursor-default"}`}>
                        <input
                            type="checkbox"
                            checked={handover.admin_finalized}
                            disabled={currentUser?.role?.name !== "admin" || !hasEvidence || handover.admin_finalized}
                            onChange={currentUser?.role?.name === "admin" && !handover.admin_finalized ? () => setDialogOpen(true) : undefined}
                            className="mt-0.5 accent-[#19E619] h-3.5 w-3.5 shrink-0"
                        />
                        <span className="text-xs text-slate-600">I confirm the handover is complete.</span>
                    </label>
                </div>
            </div>

            <ActionDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onConfirm={handleFinalize}
                onContinue={() => setDialogOpen(false)}
                title="Confirm Handover?"
                description={
                    <div className="flex flex-col gap-3 text-left">
                        <p className="text-sm text-slate-600 text-center">
                            You are confirming the handover is complete. Please review the uploaded evidence below.
                        </p>
                        <div className="flex flex-col gap-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                            {attachments.map((att) => (
                                <div key={att.id} className="flex items-center gap-2">
                                    <FileText className="h-3.5 w-3.5 text-slate-400 shrink-0"/>
                                    <span className="text-xs text-slate-700 truncate">{att.filename}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                }
                confirmText="Yes, Confirm"
                successTitle="Handover Confirmed!"
                successDescription="The other party will be notified."
            />
        </div>
    );
}