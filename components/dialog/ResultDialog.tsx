"use client";

import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogAction,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TriangleAlert, CircleCheck } from "lucide-react";

interface ResultDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    type: "success" | "error";
    title?: string;
    description?: string;
}

export function ResultDialog({
    open,
    onOpenChange,
    type,
    title,
    description,
}: ResultDialogProps) {
    const isSuccess = type === "success";

    const defaultTitle = isSuccess ? "Process Completed Successfully" : "Failed to Continue Process";
    const defaultDescription = isSuccess
        ? "Your action has been completed successfully."
        : "An unexpected error occurred while processing your request.";

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="w-[488px] h-[260px] flex flex-col items-center justify-center gap-0 p-8">
                <AlertDialogTitle className="sr-only">
                    {isSuccess ? "Process Completed Successfully" : "Failed to Continue Process"}
                </AlertDialogTitle>

                {/* Icon */}
                {isSuccess ? (
                    <CircleCheck className="size-10 text-green-500 mb-3" strokeWidth={2} />
                ) : (
                    <TriangleAlert className="size-10 text-red-500 mb-3" strokeWidth={2} />
                )}

                {/* Title */}
                <h2 className="text-[15px] font-bold text-gray-900 text-center leading-snug mb-2">
                    {title ?? defaultTitle}
                </h2>

                {/* Description */}
                <p className="text-sm text-gray-500 text-center leading-relaxed mb-5">
                    {description ?? defaultDescription}
                </p>

                {/* Button */}
                <AlertDialogAction
                    onClick={() => onOpenChange(false)}
                    className={
                        isSuccess
                            ? "w-full h-11 rounded-xl bg-green-500 hover:bg-green-600 text-gray-900 font-bold"
                            : "w-full h-11 rounded-xl bg-white border-2 border-red-500 text-red-500 hover:bg-red-50 font-bold shadow-none"
                    }
                >
                    Continue
                </AlertDialogAction>

            </AlertDialogContent>
        </AlertDialog>
    );
}
