"use client";

import { useState, useEffect } from "react";
import { Flag, XCircle, Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { reportServices } from "@/services/reportServices";
import { generalService } from "@/services/generalServices";
import { Tag } from "@/types/general";
import { SearchableCombobox } from "@/components/combobox/SearchableCombobox";

interface ReportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    referenceType: string;
    referenceId: string;
    onSuccess?: () => void;
}

export function ReportDialog({
    open,
    onOpenChange,
    referenceType,
    referenceId,
    onSuccess,
}: ReportDialogProps) {
    const [notes, setNotes] = useState("");
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [loadingTags, setLoadingTags] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch report tags when dialog opens
    useEffect(() => {
        if (!open) return;

        const controller = new AbortController();
        setLoadingTags(true);

        generalService
            .getTags("report_reason", controller.signal)
            .then((data) => setTags(data))
            .catch((err) => {
                if (err.name !== "CanceledError") {
                    // fallback: no tags shown on error
                    setTags([]);
                }
            })
            .finally(() => setLoadingTags(false));

        return () => controller.abort();
    }, [open]);

    const handleClose = () => {
        if (isSubmitting) return;
        setNotes("");
        setSelectedTagIds([]);
        onOpenChange(false);
    };

    const handleSubmit = async () => {
        if (!notes.trim()) {
            toast.error("Notes are required.");
            return;
        }

        setIsSubmitting(true);
        try {
            await reportServices.createReport({
                reference_type: referenceType,
                reference_id: referenceId,
                notes: notes.trim(),
                tag_ids: selectedTagIds.length > 0 ? selectedTagIds : undefined,
            });

            toast.success("Report submitted successfully.");
            setNotes("");
            setSelectedTagIds([]);
            onOpenChange(false);
            onSuccess?.();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            const message =
                err?.response?.data?.message ?? "Failed to submit report. Please try again.";
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md rounded-2xl p-6" showCloseButton={false}>
                {/* Header */}
                <DialogHeader className="space-y-1 pb-4 mb-4 border-b border-gray-200">
                    <DialogTitle className="text-lg font-semibold">
                        Reports
                    </DialogTitle>
                </DialogHeader>

                {/* Body */}
                <div className="space-y-4">
                    {/* Notes Field */}
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700">
                            Notes
                        </Label>
                        <Textarea
                            id="report-notes"
                            placeholder="Please provide details about why you are reporting this post."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={4}
                            disabled={isSubmitting}
                            className="resize-none rounded-lg bg-slate-50 w-full text-sm text-gray-700 placeholder:text-gray-400"
                        />
                    </div>

                    {/* Tags Field */}
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700">
                            Tags
                        </Label>
                        <SearchableCombobox
                            options={tags}
                            selectedValues={selectedTagIds}
                            onSelect={(id) => {
                                setSelectedTagIds((prev) =>
                                    prev.includes(id)
                                        ? prev.filter((t) => t !== id)
                                        : [...prev, id]
                                );
                            }}
                            isLoading={loadingTags}
                            placeholder="Select tag..."
                            emptyMessage="No tags found."
                            mode="single"
                            disabled={isSubmitting}
                            className="w-full h-10 rounded-lg"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="flex-1 rounded-xl border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600 font-semibold gap-2"
                    >
                        <XCircle className="h-4 w-4" />
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting || !notes.trim()}
                        className="flex-1 rounded-xl bg-[#19E619] hover:bg-green-500 text-black font-semibold gap-2 disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Flag className="h-4 w-4" />
                        )}
                        Report
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
