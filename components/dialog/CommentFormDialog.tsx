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
}

export default function CommentFormDialog({
                                              postId,
                                              parentId,
                                              trigger,
                                              userName,
                                              onSuccessAction,
                                          }: CommentFormDialogProps) {
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <button
                        className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-[#19E619] transition-colors">
                        <MessageSquareReply className="h-4 w-4"/>
                        Reply
                    </button>
                )}
            </DialogTrigger>
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
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}