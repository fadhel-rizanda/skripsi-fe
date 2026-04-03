"use client"

import { ReactNode, useState } from "react"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import CommunityForm from "@/components/form/CommunityForm"
import { Icon } from "@iconify/react";

type CommunityFormDialogProps = {
    mode: "create" | "edit"
    communityId?: string
    trigger?: ReactNode
    open?: boolean
    onOpenChangeAction?: (open: boolean) => void
}

export default function CommunityFormDialog({
    mode,
    communityId,
    trigger,
    open,
    onOpenChangeAction,
}: CommunityFormDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false)
    const isControlled = typeof open === "boolean"
    const dialogOpen = isControlled ? open : internalOpen

    const handleOpenChange = (nextOpen: boolean) => {
        if (!isControlled) {
            setInternalOpen(nextOpen)
        }
        onOpenChangeAction?.(nextOpen)
    }

    const handleSuccess = () => {
        handleOpenChange(false);
    }

    const resolvedTrigger = trigger ?? (!isControlled ? (
            <Button className="bg-[#19E619] hover:bg-green-500 text-black p-5! font-bold">
                <Icon icon="ph:users-three" /> {mode === "create" ? "Create Community" : "Edit Community"}
            </Button>
        ) : null)

    return (
        <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
            {resolvedTrigger && (
                <DialogTrigger asChild>
                    {resolvedTrigger}
                </DialogTrigger>
            )}
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto scrollbar-hide p-0 rounded-xl">
                <DialogTitle className="sr-only">
                    {mode === "create" ? "Create Community" : "Edit Community"}
                </DialogTitle>
                <CommunityForm
                    mode={mode}
                    communityId={communityId}
                    onSuccess={handleSuccess}
                />
            </DialogContent>
        </Dialog>
    )
}