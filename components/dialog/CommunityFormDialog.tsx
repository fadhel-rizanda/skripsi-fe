"use client"

import {ReactNode, useState} from "react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import CommunityForm from "@/components/form/CommunityForm"
import {Icon} from "@iconify/react";

type CommunityFormDialogProps = {
    mode: "create" | "edit"
    communityId?: string
    trigger?: ReactNode
}

export default function CommunityFormDialog({ mode, communityId, trigger }: CommunityFormDialogProps) {
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ?? <Button className="bg-[#19E619] hover:bg-green-500 text-black p-5! font-bold"><Icon icon="ph:users-three" /> {mode === "create" ? "Create Community" : "Edit Community"}</Button>}
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto scrollbar-hide p-0 rounded-xl">
                <CommunityForm mode={mode} communityId={communityId} />
            </DialogContent>
        </Dialog>
    )
}