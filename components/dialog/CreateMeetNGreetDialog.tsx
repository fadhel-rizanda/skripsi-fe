"use client"

import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog"
import {MeetNGreetForm} from "@/components/form/MeetNGreetForm"
import {MeetNGreet} from "@/types/adoption";
import {CalendarClock} from "lucide-react";
import {Button} from "@/components/ui/button";
import {ReactNode, useState} from "react";

interface CreateMeetNGreetDialogProps {
    adoptionId: string
    trigger?: ReactNode
    existing?: MeetNGreet
    onSuccessAction?: () => void
}

export function CreateMeetNGreetDialog({
                                           adoptionId,
                                           trigger,
                                           existing,
                                           onSuccessAction
                                       }: CreateMeetNGreetDialogProps) {
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button
                        className="bg-[#19E619] hover:bg-green-500 text-black rounded-xl h-8 px-3 text-xs font-bold gap-1.5"
                    >
                        <CalendarClock className="h-3.5 w-3.5"/>
                        Create Schedule
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg rounded-2xl overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Schedule Meet & Greet</DialogTitle>
                </DialogHeader>
                <div className="py-2">
                    <MeetNGreetForm
                        adoptionId={adoptionId}
                        existing={existing}
                        onSuccess={() => {
                            setOpen(false)
                            onSuccessAction?.();
                        }}
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}