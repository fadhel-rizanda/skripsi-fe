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
import {AlertCircle} from "lucide-react"

interface ConfirmationDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
    title?: string
    description?: string
    confirmText?: string
    cancelText?: string
    variant?: "default" | "destructive"
}

export function ConfirmationDialog({
                                       open,
                                       onOpenChange,
                                       onConfirm,
                                       title = "Are you sure want to continue this process?",
                                       description = "This action can't be undone. Please make sure you really want to proceed.",
                                       confirmText = "Confirm",
                                       cancelText = "Cancel",
                                       variant = "default",
                                   }: ConfirmationDialogProps) {
    const handleConfirm = () => {
        onConfirm()
        onOpenChange(false)
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="sm:max-w-106.25 w-fit p-10">
                <AlertDialogHeader>
                    <div className="items-center flex flex-col gap-2">
                        <AlertCircle className="h-10 w-10 text-gray-600"/>
                        <AlertDialogTitle className="text-center text-xl">
                            {title}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-center text-sm text-gray-500 w-84">
                            {description}
                        </AlertDialogDescription>
                    </div>

                </AlertDialogHeader>
                <AlertDialogFooter className="sm:justify-center gap-2">
                    <AlertDialogCancel className="w-32 border-red-500 text-red-500! hover:bg-red-50">
                        {cancelText}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        className={
                            variant === "destructive"
                                ? "w-32 bg-red-500! hover:bg-red-600! text-white!"
                                : "w-32 bg-green-500! hover:bg-green-600! text-white!"
                        }
                    >
                        {confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}