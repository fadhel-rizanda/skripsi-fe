"use client"

import {ReactNode, useState} from "react"
import {Dialog, DialogContent, DialogTitle, DialogTrigger} from "@/components/ui/dialog"
import {Button} from "@/components/ui/button"
import {PlusSquare} from "lucide-react"
import SetRequirementForm from "@/components/form/SetRequirementForm";

type Props = {
    adoptionId: string
    trigger?: ReactNode
    onSuccessAction?: () => void
}

export default function SetRequirementDialog({
                                                 adoptionId,
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
                        <PlusSquare className="h-3.5 w-3.5"/>
                        Set Requirement
                    </Button>
                )}
            </DialogTrigger>

            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl">
                <DialogTitle className="text-xl font-semibold">Set Requirements</DialogTitle>
                <SetRequirementForm
                    adoptionId={adoptionId}
                    onSuccess={() => {
                        setOpen(false)
                        onSuccessAction?.()
                    }}
                    onCancel={() => setOpen(false)}
                />
            </DialogContent>
        </Dialog>
    )
}