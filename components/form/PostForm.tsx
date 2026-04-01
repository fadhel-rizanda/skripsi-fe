"use client"

import { useState, useEffect, useRef, ChangeEvent } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ActionDialog } from "@/components/dialog/ActionDialog"
import { CreatePostSchema, CreatePostInput } from "@/schemas/post.schema"
import { useTagsOptions } from "@/hooks/useFilterOptions"
import { SearchableCombobox } from "@/components/combobox/SearchableCombobox"
import { TagBadge } from "@/components/badge/TagBadge"
import { useRouter } from "next/navigation"
import { postService } from "@/services/postServices"
import { Tag } from "@/types/general"
import { Icon } from "@iconify/react"
import { openAttachment, uploadAttachment } from "@/lib/attachment-helpers"
import { Attachment } from "@/types/attachment"
import {TAG_TYPE} from "@/constant/tag-type";

type PostFormProps = {
    mode: "create" | "edit"
    postId?: string
    communityId?: string
    onSuccessAction?: () => void
}

export default function PostForm({ mode, postId, communityId, onSuccessAction }: PostFormProps) {
    const isEditMode = mode === "edit"
    const router = useRouter()
    const [dialogOpen, setDialogOpen] = useState(false)
    const [isLoadingDetail, setIsLoadingDetail] = useState(false)

    const [attachmentFile, setAttachmentFile] = useState<File | undefined>()
    const [existingAttachment, setExistingAttachment] = useState<{
        id: string
        filename?: string
        mime_type?: string
    } | undefined>()
    const [downloadingId, setDownloadingId] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement | null>(null)

    const {
        options: postTags,
        isLoading: isLoadingTags,
        setSearch: setTagSearch,
        loadMore: loadMoreTags,
        hasMore: hasMoreTags
    } = useTagsOptions(TAG_TYPE.POST)

    const form = useForm<CreatePostInput>({
        resolver: zodResolver(CreatePostSchema),
        defaultValues: {
            title: "",
            content: "",
            community_id: communityId,
            tag_ids: [],
            attachment_id: undefined,
        },
    })

    useEffect(() => {
        if (!isEditMode || !postId) return
        const fetchPost = async () => {
            setIsLoadingDetail(true)
            try {
                const res = await postService.getPostById(postId)
                form.reset({
                    title: res.title,
                    content: res.content,
                    community_id: res.community_id,
                    tag_ids: res.tags?.map((t: Tag) => t.id) ?? [],
                    attachment_id: res.attachment?.id ?? undefined,
                })
                if (res.attachment) {
                    setExistingAttachment({
                        id: res.attachment.id,
                        mime_type: res.attachment.mime_type,
                        filename: res.attachment.filename ?? "Existing Attachment",
                    })
                }
            } finally {
                setIsLoadingDetail(false)
            }
        }
        fetchPost()
    }, [postId, isEditMode])

    const handleAttachmentUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files?.length) return

        const file = files[0]

        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
        if (!allowedTypes.includes(file.type)) {
            form.setError("attachment_id", {
                type: "manual",
                message: "Only JPEG, PNG, GIF, or WebP images are allowed",
            })
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            form.setError("attachment_id", {
                type: "manual",
                message: "File size must be less than 5MB",
            })
            return
        }

        setAttachmentFile(file)
        form.clearErrors("attachment_id")
    }

    const removeAttachmentFile = () => {
        setAttachmentFile(undefined)
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    const removeExistingAttachment = () => {
        setExistingAttachment(undefined)
        form.setValue("attachment_id", undefined)
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    const handleOpenExistingFile = async (file: Attachment) => {
        try {
            setDownloadingId(file.id)
            await openAttachment(file)
        } catch (err) {
            console.error("Failed to open file:", err)
        } finally {
            setDownloadingId(null)
        }
    }

    const handleOpenNewFile = (file: File) => {
        const fileUrl = URL.createObjectURL(file)
        window.open(fileUrl, "_blank")
        setTimeout(() => URL.revokeObjectURL(fileUrl), 1000)
    }

    const handleFinalSubmit = async () => {
        const values = form.getValues()

        const uploadedAttachmentId = attachmentFile
            ? await uploadAttachment(attachmentFile, true)
            : undefined

        const payload: CreatePostInput = {
            ...values,
            attachment_id: uploadedAttachmentId ?? values.attachment_id,
        }

        if (isEditMode && postId) {
            await postService.updatePost(postId, payload)
        } else {
            await postService.createPost(payload)
        }
        onSuccessAction?.()
    }

    if (isEditMode && isLoadingDetail) return <div className="p-10 text-center">Loading...</div>

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(() => setDialogOpen(true))} className="space-y-5">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs sm:text-sm">Title *</FormLabel>
                            <FormControl>
                                <Input placeholder="What's on your mind?" {...field} className="h-9 text-xs sm:text-sm px-3" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs sm:text-sm">Content *</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Share your thoughts..."
                                    className="min-h-32 h-28 text-xs sm:text-sm px-3"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="tag_ids"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs sm:text-sm">Tags*</FormLabel>
                            <FormControl>
                                <SearchableCombobox
                                    options={postTags}
                                    selectedValues={field.value || []}
                                    onSelect={(id) => {
                                        const current = field.value || []
                                        field.onChange(
                                            current.includes(id)
                                                ? current.filter((i) => i !== id)
                                                : [...current, id]
                                        )
                                    }}
                                    onSearch={setTagSearch}
                                    onLoadMore={loadMoreTags}
                                    isLoading={isLoadingTags}
                                    hasMore={hasMoreTags}
                                    mode="multiple"
                                    className="w-full h-9 text-xs sm:text-sm px-3"
                                />
                            </FormControl>
                            <FormMessage />
                            <div className="flex flex-wrap gap-2 mt-2">
                                {field.value?.map((id) => (
                                    <TagBadge
                                        key={id}
                                        label={postTags.find((t) => t.id === id)?.name || id}
                                        onRemove={() =>
                                            field.onChange(field.value?.filter((i) => i !== id))
                                        }
                                    />
                                ))}
                            </div>
                        </FormItem>
                    )}
                />

                {/* Attachment Upload */}
                <FormField
                    control={form.control}
                    name="attachment_id"
                    render={() => (
                        <FormItem>
                            <FormLabel className="text-xs sm:text-sm">Attachment</FormLabel>
                            <FormControl>
                                <div className="border-2 border-dashed border-[#E0E0E0] rounded-lg p-4 sm:p-6 flex flex-col items-center justify-center">
                                    <Icon icon="ph:image" className="w-8 h-8 sm:w-10 sm:h-10 text-[#BDBDBD] mb-2" />
                                    <p className="font-medium text-[#424242] text-xs sm:text-sm">Upload an Image</p>
                                    <p className="text-xs text-[#757575] mb-2 mt-1">PNG, JPG, GIF, WebP (MAX. 5MB)</p>
                                    <label htmlFor="post-attachment-upload">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="px-3 sm:px-6 h-9 rounded-md border-[#E0E0E0] text-xs sm:text-sm cursor-pointer"
                                            asChild
                                        >
                                            <span>Select File</span>
                                        </Button>
                                    </label>
                                    <input
                                        ref={fileInputRef}
                                        id="post-attachment-upload"
                                        type="file"
                                        className="hidden"
                                        accept="image/jpeg,image/png,image/gif,image/webp"
                                        onChange={handleAttachmentUpload}
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />

                            {/* Existing attachment (edit mode) */}
                            {existingAttachment && !attachmentFile && (
                                <div className="mt-3 flex items-center justify-between p-3 border border-[#E0E0E0] rounded-md text-sm">
                                    <span
                                        onClick={() => handleOpenExistingFile(existingAttachment as Attachment)}
                                        className="truncate flex-1 cursor-pointer hover:underline flex items-center gap-2"
                                    >
                                        {downloadingId === existingAttachment.id && (
                                            <Icon icon="ph:spinner" className="w-4 h-4 animate-spin shrink-0" />
                                        )}
                                        {existingAttachment.filename}
                                    </span>
                                    <Icon
                                        icon="ph:trash"
                                        className="w-4 h-4 text-[#F44336] cursor-pointer ml-2 shrink-0 hover:text-[#D32F2F]"
                                        onClick={removeExistingAttachment}
                                    />
                                </div>
                            )}

                            {/* Newly selected file */}
                            {attachmentFile && (
                                <div className="mt-3 flex items-center justify-between p-3 border border-green-300 bg-green-50 rounded-md text-sm">
                                    <span
                                        onClick={() => handleOpenNewFile(attachmentFile)}
                                        className="truncate flex-1 cursor-pointer hover:underline text-green-700"
                                    >
                                        {attachmentFile.name}
                                    </span>
                                    <Icon
                                        icon="ph:trash"
                                        className="w-4 h-4 text-[#F44336] cursor-pointer ml-2 shrink-0 hover:text-[#D32F2F]"
                                        onClick={removeAttachmentFile}
                                    />
                                </div>
                            )}
                        </FormItem>
                    )}
                />

                <div className="flex justify-end pt-3 border-t">
                    <Button
                        type="submit"
                        className="bg-[#19E619] hover:bg-green-500 text-black font-bold h-9 text-xs sm:text-sm px-4"
                    >
                        {isEditMode ? "Update Post" : "Post Now"}
                    </Button>
                </div>

                <ActionDialog
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                    onConfirm={handleFinalSubmit}
                    onContinue={() => {
                        setDialogOpen(false)
                        router.refresh()
                    }}
                    title={isEditMode ? "Update Post?" : "Create Post?"}
                    description="Make sure your post follows our community guidelines."
                    successTitle="Success!"
                    successDescription={isEditMode ? "Post updated." : "Post published."}
                />
            </form>
        </Form>
    )
}