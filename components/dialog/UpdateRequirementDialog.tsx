"use client"

import { ReactNode, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Edit3 } from "lucide-react"
import UpdateRequirementForm from "@/components/form/UpdateRequirementForm";
import { Requirement } from "@/types/adoption";

type Props = {
    adoptionId: string
    requirement: Requirement
    trigger?: ReactNode
    onSuccessAction?: () => void
}

export default function UpdateRequirementDialog({
    adoptionId,
    requirement,
    trigger,
    onSuccessAction,
}: Props) {
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button
                        className="bg-[#19E619] hover:bg-green-500 text-black rounded-xl h-8 px-3 text-xs font-bold gap-1.5">
                        <Edit3 className="h-3.5 w-3.5" />
                        Update Requirement
                    </Button>
                )}
            </DialogTrigger>

            <DialogContent className="sm:max-w-md w-[calc(100%-2rem)] max-h-[90vh] overflow-y-auto rounded-2xl p-5 sm:p-6">
                <DialogHeader className="text-center sm:text-center border-b pb-4 mb-4 sm:mb-5">
                    <DialogTitle className="text-center text-lg sm:text-xl font-bold">Set Requirement</DialogTitle>
                </DialogHeader>
                <div className="py-2">
                    <UpdateRequirementForm
                        adoptionId={adoptionId}
                        requirement={requirement}
                        onSuccess={() => {
                            setOpen(false)
                            onSuccessAction?.()
                        }}
                        onCancel={() => setOpen(false)}
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}