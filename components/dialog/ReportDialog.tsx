"use client";

import {useState, useEffect, ReactNode} from "react";
import { Flag, XCircle, Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { reportServices } from "@/services/reportServices";
import { generalService } from "@/services/generalServices";
import { Tag } from "@/types/general";
import { SearchableCombobox } from "@/components/combobox/SearchableCombobox";
import { ActionDialog } from "@/components/dialog/ActionDialog";

interface ReportDialogProps {
    referenceType: string;
    referenceId: string;
    onSuccess?: () => void;
    trigger?: ReactNode;
}

export function ReportDialog({
    referenceType,
    referenceId,
    onSuccess,
    trigger,
}: ReportDialogProps) {
    const [open, setOpen] = useState(false);
    const [notes, setNotes] = useState("");
    const [selectedTagId, setSelectedTagId] = useState<string>("");
    const [tags, setTags] = useState<Tag[]>([]);
    const [loadingTags, setLoadingTags] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

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
        setSelectedTagId("");
        setIsConfirmOpen(false);
        setOpen(false);
    };

    const onReportClick = () => {
        if (!notes.trim()) {
            toast.error("Notes are required.");
            return;
        }

        if (!selectedTagId) {
            toast.error("Please select a report tag.");
            return;
        }
        setIsConfirmOpen(true);
    };

    const executeReport = async () => {
        setIsSubmitting(true);
        try {
            await reportServices.createReport({
                reference_type: referenceType,
                reference_id: referenceId,
                notes: notes.trim(),
                tag_ids: selectedTagId ? [selectedTagId] : undefined,
            });
            onSuccess?.();
        } catch (error: any) {
            const message = error?.response?.data?.message ?? "Failed to submit report.";
            toast.error(message);
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    {trigger ?? (
                        <Button variant="ghost" size="sm" className="text-red-600 gap-1.5 px-2">
                            <Flag className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span className="text-xs sm:text-sm font-medium">Report</span>
                        </Button>
                    )}
                </DialogTrigger>

                <DialogContent className="w-[95vw] sm:w-full max-w-[95vw] sm:max-w-md rounded-xl sm:rounded-2xl p-4 sm:p-6" showCloseButton={false}>
                    {/* Header */}
                    <DialogHeader className="space-y-1 pb-2 border-b border-gray-200">
                        <DialogTitle className="text-base sm:text-lg font-semibold">
                            Reports
                        </DialogTitle>
                    </DialogHeader>

                    {/* Body */}
                    <div className="space-y-4">
                        {/* Notes Field */}
                        <div className="space-y-2">
                            <Label className="text-xs sm:text-sm font-semibold text-gray-700">
                                Notes*
                            </Label>
                            <Textarea
                                id="report-notes"
                                placeholder="Please provide details about why you are reporting this post."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={4}
                                disabled={isSubmitting}
                                className="resize-none rounded-lg bg-slate-50 w-full text-xs sm:text-sm text-gray-700 placeholder:text-gray-400"
                            />
                        </div>

                        {/* Tags Field */}
                        <div className="space-y-2">
                            <Label className="text-xs sm:text-sm font-semibold text-gray-700">
                                Tags*
                            </Label>
                            <SearchableCombobox
                                options={tags}
                                selectedValues={selectedTagId ? [selectedTagId] : []}
                                onSelect={(id) => {
                                    setSelectedTagId((prev) => prev === id ? "" : id);
                                }}
                                isLoading={loadingTags}
                                placeholder="Select tag..."
                                emptyMessage="No tags found."
                                mode="single"
                                disabled={isSubmitting}
                                className="w-full h-10 text-xs sm:text-sm rounded-lg"
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
                            className="flex-1 rounded-lg sm:rounded-xl border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600 font-semibold gap-1 sm:gap-2 text-xs sm:text-sm h-9 sm:h-10"
                        >
                            <XCircle className="h-3 w-3 sm:h-4 sm:w-4"/>
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={onReportClick}
                            disabled={isSubmitting || !notes.trim() || !selectedTagId}
                            className="flex-1 rounded-lg sm:rounded-xl bg-[#19E619] hover:bg-green-500 text-black font-semibold gap-1 sm:gap-2 disabled:opacity-50 text-xs sm:text-sm h-9 sm:h-10"
                        >
                            {isSubmitting ? (
                                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin"/>
                            ) : (
                                <Flag className="h-3 w-3 sm:h-4 sm:w-4"/>
                            )}
                            Report
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
            <ActionDialog
                open={isConfirmOpen}
                onOpenChange={setIsConfirmOpen}
                onConfirm={executeReport}
                onContinue={handleClose}
                title="Submit Report?"
                description="Are you sure you want to report this? This action will be reviewed by our moderators."
                confirmText="Yes, Submit Report"
                cancelText="Check Again"
                successTitle="Report Submitted"
                successDescription="Thank you for keeping our community safe. We will review your report shortly."
            />
        </>
    );
}
