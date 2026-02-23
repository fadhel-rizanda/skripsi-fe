"use client";

import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CircleCheck } from "lucide-react";
import { useState } from "react";

interface ActivateUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (notes: string) => void;
    userName?: string;
    isLoading?: boolean;
}

export function ActivateUserDialog({
    open,
    onOpenChange,
    onConfirm,
    userName,
    isLoading = false,
}: ActivateUserDialogProps) {
    const [notes, setNotes] = useState("");

    const handleConfirm = () => {
        if (!notes.trim()) return;
        onConfirm(notes.trim());
        setNotes("");
    };

    const handleOpenChange = (val: boolean) => {
        if (!val) setNotes("");
        onOpenChange(val);
    };

    return (
        <AlertDialog open={open} onOpenChange={handleOpenChange}>
            <AlertDialogContent className="w-[488px] flex flex-col items-center justify-center gap-0 p-8">
                <AlertDialogTitle className="sr-only">Activate User Confirmation</AlertDialogTitle>

                {/* Icon */}
                <div className="rounded-full border-[2.5px] border-green-600 p-1 mb-3">
                    <CircleCheck className="size-6 text-green-600" strokeWidth={2.5} />
                </div>

                {/* Title */}
                <h2 className="text-[15px] font-bold text-gray-900 text-center leading-snug mb-1">
                    Are you sure want to activate this user?
                </h2>

                {/* Description */}
                <p className="text-sm text-gray-500 text-center leading-relaxed mb-3">
                    {userName ? <><strong>&ldquo;{userName}&rdquo;</strong>{" "}</> : ""}
                    This will restore the user&apos;s access to the platform.
                </p>

                {/* Notes Input */}
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Reason for activation (required)..."
                    rows={2}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-gray-300 text-gray-700 mb-4 placeholder:text-gray-400"
                />

                {/* Buttons */}
                <AlertDialogFooter className="w-full grid grid-cols-2 gap-3 sm:justify-stretch">
                    <AlertDialogCancel className="border-2 border-gray-300 text-gray-600 bg-white hover:bg-gray-50 hover:text-gray-700 font-bold rounded-xl h-11 m-0">
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        disabled={isLoading || !notes.trim()}
                        className="bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl h-11 disabled:opacity-50"
                    >
                        {isLoading ? "Processing..." : "Activate"}
                    </AlertDialogAction>
                </AlertDialogFooter>

            </AlertDialogContent>
        </AlertDialog>
    );
}
