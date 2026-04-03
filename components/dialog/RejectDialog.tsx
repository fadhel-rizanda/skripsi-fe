"use client"

import {useState} from "react"
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription} from "@/components/ui/dialog"
import {Button} from "@/components/ui/button"
import {Textarea} from "@/components/ui/textarea"
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {Loader2} from "lucide-react"
import {RejectInput, RejectSchema} from "@/schemas/adoption.schema";

interface RejectDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: (notes: string) => Promise<void>
    requirementName: string
}

export function RejectDialog({open, onOpenChange, onConfirm, requirementName}: RejectDialogProps) {
    const [loading, setLoading] = useState(false)
    const {register, handleSubmit, formState: {errors}, reset} = useForm<RejectInput>({
        resolver: zodResolver(RejectSchema)
    })

    const handleReject = async (data: RejectInput) => {
        setLoading(true)
        try {
            await onConfirm(data.notes)
            reset()
            onOpenChange(false)
        } catch (error) {
            console.error("Failed to reject requirement:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md w-[calc(100%-2rem)] rounded-2xl p-5 sm:p-6">
                <DialogHeader className="space-y-2 text-center sm:text-center border-b pb-4 mb-4 sm:mb-5">
                    <DialogTitle className="text-center text-lg sm:text-xl font-bold">Reject Requirement</DialogTitle>
                    <DialogDescription className="text-center text-sm">
                        Please provide a reason for rejecting <strong>{requirementName}</strong>. This will be sent to the adopter.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleReject)} className="space-y-4">
                    <div className="space-y-2">
                        <Textarea
                            {...register("notes")}
                            placeholder="e.g. The photo is too blurry or the document is expired."
                            className="min-h-25 resize-none rounded-xl bg-slate-50 max-w-100 w-full"
                        />
                        {errors.notes && (
                            <p className="text-red-500 text-xs font-medium">{errors.notes.message}</p>
                        )}
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="rounded-xl flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="destructive"
                            disabled={loading}
                            className="rounded-xl flex-1 bg-red-600 hover:bg-red-700"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin"/> : "Confirm Rejection"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}