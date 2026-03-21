"use client"

import {ReactNode, useState} from "react"
import {Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle} from "@/components/ui/dialog"
import {Button} from "@/components/ui/button"
import {Icon} from "@iconify/react"
import PostForm from "@/components/form/PostForm"

type PostFormDialogProps = {
    mode: "create" | "edit"
    postId?: string
    communityId?: string
    trigger?: ReactNode
    onSuccessAction?: () => void
    open?: boolean
    onOpenChangeAction?: (open: boolean) => void
}

export default function PostFormDialog({
                                           mode,
                                           postId,
                                           communityId,
                                           trigger,
                                           onSuccessAction,
                                           open: controlledOpen,
                                           onOpenChangeAction: controlledOnOpenChange,
                                       }: PostFormDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false)

    // Jika open/onOpenChange dipass dari luar, pakai itu; kalau tidak, pakai internal state
    const isControlled = controlledOpen !== undefined
    const open = isControlled ? controlledOpen : internalOpen
    const setOpen = isControlled ? controlledOnOpenChange! : setInternalOpen

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {/* Sembunyikan trigger kalau dikontrol dari luar (e.g. dari PostCard) */}
            {!isControlled && (
                <DialogTrigger asChild>
                    {trigger ?? (
                        <Button className="bg-[#19E619] hover:bg-green-500 text-black font-bold gap-2">
                            <Icon icon="ph:plus-circle-bold" className="w-5 h-5"/>
                            {mode === "create" ? "Create Post" : "Edit Post"}
                        </Button>
                    )}
                </DialogTrigger>
            )}
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl p-6">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold mb-4">
                        {mode === "create" ? "New Post" : "Edit Post"}
                    </DialogTitle>
                </DialogHeader>
                <PostForm
                    mode={mode}
                    postId={postId}
                    communityId={communityId}
                    onSuccessAction={() => {
                        setOpen(false)
                        onSuccessAction?.()
                    }}
                />
            </DialogContent>
        </Dialog>
    )
}