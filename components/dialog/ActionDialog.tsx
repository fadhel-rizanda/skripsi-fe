"use client"

import * as React from "react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {CheckCircle2, AlertCircle, Loader2} from "lucide-react"
import {cn} from "@/lib/utils"
import {ReactNode} from "react";
import {toast} from "sonner";

type DialogStatus = "idle" | "loading" | "success" | "error"

interface ActionDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm?: () => Promise<void> | void
    onContinue?: () => void
    status?: DialogStatus
    title?: string
    description?: ReactNode
    successTitle?: string
    successDescription?: string
    errorTitle?: string
    errorDescription?: string
    confirmText?: string
    cancelText?: string
    confirmVariant?: "default" | "destructive"
}

export function ActionDialog({
                                 open,
                                 onOpenChange,
                                 onConfirm,
                                 onContinue,
                                 status: externalStatus,
                                 title = "Are you sure want to continue?",
                                 description = "This action can't be undone. Please make sure you really want to proceed.",
                                 successTitle = "Process Completed Successfully",
                                 successDescription = "Your action has been completed successfully.",
                                 errorTitle = "Process Failed",
                                 errorDescription = "An unexpected error occurred while processing your request.",
                                 confirmText = "Confirm",
                                 cancelText = "Cancel",
                                 confirmVariant = "default"
                             }: ActionDialogProps) {
    const [internalStatus, setInternalStatus] = React.useState<DialogStatus>("idle")

    const currentStatus = externalStatus || internalStatus

    React.useEffect(() => {
        if (open && !externalStatus) setInternalStatus("idle")
    }, [open, externalStatus])

    const handleConfirm = async (e: React.MouseEvent) => {
        e.preventDefault()
        if (onConfirm) {
            setInternalStatus("loading")
            try {
                await onConfirm()
                setInternalStatus("success")
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || "An unexpected error occurred";
                toast.error(errorMessage);
                setInternalStatus("error")
            }
        }
    }

    const handleFinalAction = () => {
        if (currentStatus === "success" && onContinue) {
            onContinue()
        }
        onOpenChange(false)
    }

    const isIdle = currentStatus === "idle"
    const isLoading = currentStatus === "loading"
    const isSuccess = currentStatus === "success"
    const isError = currentStatus === "error"

    return (
        <AlertDialog open={open} onOpenChange={isLoading ? undefined : onOpenChange}>
            <AlertDialogContent
                size="sm"
                className="w-[calc(100%-2rem)] max-w-88 rounded-xl sm:rounded-2xl p-5 sm:p-6 gap-3 sm:gap-4"
            >
                <AlertDialogHeader>
                    <div className="items-center flex flex-col gap-3 sm:gap-4">
                        {/* Icon */}
                        {isIdle && (
                            <AlertCircle className="h-8 w-8 sm:h-10 sm:w-10 text-gray-600"/>
                        )}
                        {isLoading && (
                            <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 text-green-600 animate-spin" strokeWidth={2.5}/>
                        )}
                        {isSuccess && (
                            <div className="rounded-full bg-green-100 p-2.5 sm:p-3">
                                <CheckCircle2 className="h-10 w-10 sm:h-12 sm:w-12 text-green-600" strokeWidth={2.5}/>
                            </div>
                        )}
                        {isError && (
                            <div className="rounded-full bg-red-100 p-2.5 sm:p-3">
                                <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-red-600" strokeWidth={2.5}/>
                            </div>
                        )}

                        {/* Title */}
                        <AlertDialogTitle className="text-center text-base font-semibold leading-snug">
                            {isIdle && title}
                            {isLoading && "Processing..."}
                            {isSuccess && successTitle}
                            {isError && errorTitle}
                        </AlertDialogTitle>

                        {/* Description */}
                        <AlertDialogDescription asChild className="text-center text-xs sm:text-sm text-gray-600 max-w-xs">
                            <div>
                                {isIdle && description}
                                {isLoading && "Please wait while we process your request."}
                                {isSuccess && successDescription}
                                {isError && errorDescription}
                            </div>
                        </AlertDialogDescription>
                    </div>
                </AlertDialogHeader>

                {/* Footer Buttons */}
                {!isLoading && (
                    <AlertDialogFooter
                        className={cn(
                            "mt-1 sm:mt-2",
                            isIdle
                                ? "flex-col gap-2 sm:flex-row sm:items-center sm:justify-center"
                                : "grid! grid-cols-1! place-items-center"
                        )}
                    >
                        {isIdle ? (
                            <>
                                <AlertDialogCancel className="w-full sm:w-32 h-10 sm:h-10 text-sm border-red-500! text-red-500! hover:bg-red-50! order-2 sm:order-1">
                                    {cancelText}
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleConfirm}
                                    className={cn(
                                        "w-full sm:w-32 h-10 sm:h-10 text-sm order-1 sm:order-2",
                                        confirmVariant === "destructive"
                                            ? "bg-red-500! hover:bg-red-600!"
                                            : "bg-green-500! hover:bg-green-600! text-white!"
                                    )}
                                >
                                    {confirmText}
                                </AlertDialogAction>
                            </>
                        ) : (
                            <AlertDialogAction
                                onClick={handleFinalAction}
                                className={cn(
                                    "mx-auto h-10 w-full rounded-lg text-sm font-semibold sm:h-11",
                                    isSuccess
                                        ? "max-w-48 bg-green-500! text-white! hover:bg-green-600!"
                                        : "max-w-60 border-2! border-red-500! bg-white! text-red-500! hover:bg-gray-50!"
                                )}
                            >
                                Continue
                            </AlertDialogAction>
                        )}
                    </AlertDialogFooter>
                )}
            </AlertDialogContent>
        </AlertDialog>
    )
}