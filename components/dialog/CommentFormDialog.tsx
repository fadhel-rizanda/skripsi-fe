"use client"

import {ReactNode, useState} from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {MessageSquareReply} from "lucide-react"
import CommentForm from "@/components/form/CommentForm";

type CommentFormDialogProps = {
    postId: string
    parentId?: string
    trigger?: ReactNode
    userName?: string
    onSuccessAction?: () => void
    open?: boolean
    onOpenChange?: (open: boolean) => void
    autoFocus?: boolean
}

export default function CommentFormDialog({
                                              postId,
                                              parentId,
                                              trigger,
                                              userName,
                                              onSuccessAction,
                                              open: controlledOpen,
                                              onOpenChange: controlledOnOpenChange,
                                              autoFocus,
                                          }: CommentFormDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false)
    const isControlled = controlledOpen !== undefined
    const open = isControlled ? controlledOpen : internalOpen
    const setOpen = isControlled ? (controlledOnOpenChange ?? setInternalOpen) : setInternalOpen

    const triggerEl = !isControlled ? (trigger ?? (
        <button className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-[#19E619] transition-colors">
            <MessageSquareReply className="h-4 w-4"/>
            Reply
        </button>
    )) : null

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {triggerEl && <DialogTrigger asChild>{triggerEl}</DialogTrigger>}
            <DialogContent className="sm:max-w-lg rounded-2xl p-6">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">
                        {parentId ? `Reply to ${userName ?? 'Comment'}` : "Add Comment"}
                    </DialogTitle>
                </DialogHeader>

                <div className="mt-4">
                    <CommentForm
                        postId={postId}
                        parentId={parentId}
                        onSuccessAction={() => {
                            setOpen(false)
                            onSuccessAction?.()
                        }}
                        placeholder={parentId ? "Write your reply..." : "Share your thoughts..."}
                        autoFocus={autoFocus}
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}