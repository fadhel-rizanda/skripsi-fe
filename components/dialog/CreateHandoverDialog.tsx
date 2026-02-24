"use client"

import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog"
import {MeetNGreetForm} from "@/components/form/MeetNGreetForm"
import {CalendarClock} from "lucide-react"
import {Button} from "@/components/ui/button"
import {ReactNode, useState} from "react"
import {handoverServices} from "@/services/adoptionServices"
import {CreateMeetNGreetInput} from "@/schemas/adoption.schema";

interface Props {
    adoptionId: string
    handoverId?: string
    trigger?: ReactNode
    onSuccessAction?: () => void
}

export function CreateHandoverDialog({adoptionId, handoverId, trigger, onSuccessAction}: Props) {
    const [open, setOpen] = useState(false)

    const overrideFn = handoverId
        ? (data: CreateMeetNGreetInput) => handoverServices.updateHandoverSchedule(adoptionId, handoverId, data)
        : (data: CreateMeetNGreetInput) => handoverServices.createHandover(adoptionId, data)
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button
                        className="bg-[#19E619] hover:bg-green-500 text-black rounded-xl h-8 px-3 text-xs font-bold gap-1.5">
                        <CalendarClock className="h-3.5 w-3.5"/>
                        {handoverId ? "Propose New Schedule" : "Schedule Handover"}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg rounded-2xl overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">
                        {handoverId ? "Propose New Handover Schedule" : "Schedule Handover Day"}
                    </DialogTitle>
                </DialogHeader>
                <div className="py-2">
                    <MeetNGreetForm
                        adoptionId={adoptionId}
                        context="handover"
                        overrideSubmit={overrideFn}
                        onSuccess={() => {
                            setOpen(false)
                            onSuccessAction?.()
                        }}
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}