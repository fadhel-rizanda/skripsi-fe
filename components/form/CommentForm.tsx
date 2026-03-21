"use client"

import {useState} from "react"
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {Button} from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form"
import {Textarea} from "@/components/ui/textarea"
import {CreateCommentSchema, CreateCommentInput} from "@/schemas/comment.schema"
import {Loader2, Send} from "lucide-react"
import {toast} from "sonner"
import {commentService} from "@/services/commentService";

type CommentFormProps = {
    postId: string
    parentId?: string
    onSuccessAction?: () => void
    placeholder?: string
    autoFocus?: boolean
}

export default function CommentForm({postId, parentId, onSuccessAction, placeholder, autoFocus}: CommentFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<CreateCommentInput>({
        resolver: zodResolver(CreateCommentSchema),
        defaultValues: {
            content: "",
            parent_id: parentId,
        },
    })

    const onSubmit = async (values: CreateCommentInput) => {
        setIsSubmitting(true)
        try {
            await commentService.createComment(postId, values)
            form.reset({content: "", parent_id: parentId})
            toast.success(parentId ? "Reply posted!" : "Comment posted!")
            onSuccessAction?.()
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to post comment")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                <FormField
                    control={form.control}
                    name="content"
                    render={({field}) => (
                        <FormItem>
                            <FormControl>
                                <Textarea
                                    placeholder={placeholder || "Write a comment..."}
                                    className="min-h-20 md:min-h-25 resize-none rounded-xl bg-slate-50 border-slate-200"
                                    disabled={isSubmitting}
                                    autoFocus={autoFocus}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <div className="flex justify-end">
                    <Button
                        type="submit"
                        disabled={isSubmitting || !form.watch("content").trim()}
                        className="bg-[#19E619] hover:bg-green-500 text-black font-bold rounded-xl px-6 gap-2"
                    >
                        {isSubmitting ? (
                            <Loader2 className="h-4 w-4 animate-spin"/>
                        ) : (
                            <>
                                <Send className="h-4 w-4"/>
                            </>
                        )}
                        {parentId ? "Reply" : "Comment"}

                    </Button>
                </div>
            </form>
        </Form>
    )
}