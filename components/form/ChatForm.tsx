"use client"

import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {Button} from "@/components/ui/button"
import {ActionDialog} from "@/components/dialog/ActionDialog"
import {SearchableCombobox} from "@/components/combobox/SearchableCombobox"
import {TagBadge} from "@/components/badge/TagBadge"
import {useUsersOptions} from "@/hooks/useFilterOptions"
import {chatService} from "@/services/chatServices"
import {useMemo, useState} from "react"
import {useChatStore} from "@/store/useChatStore"
import {useRouter} from "next/navigation"
import {CreateChatInput, CreateChatSchema} from "@/schemas/chat.schema"
import {useSession} from "next-auth/react"
import {cn} from "@/lib/utils"
import {Input} from "@/components/ui/input"
import {Textarea} from "@/components/ui/textarea"
import {Chat} from "@/types/chat"

type Props = {
    mode?: "create" | "update"
    chat?: Chat
    onSuccessAction?: () => void
    onCancel?: () => void
}

export default function ChatForm({
                                     mode = "create",
                                     chat,
                                     onSuccessAction,
                                     onCancel,
                                 }: Props) {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [createdChatId, setCreatedChatId] = useState<string | null>(null)

    const {triggerRefresh} = useChatStore()
    const router = useRouter()
    const {data: session} = useSession()
    const currentUserId = session?.user?.id

    const inactiveUserIds =
        chat?.users?.filter((u) => u.is_active_member === false).map((u) => u.id) ??
        []

    const form = useForm<CreateChatInput>({
        resolver: zodResolver(CreateChatSchema),
        defaultValues:
            mode === "create"
                ? {
                    type: "private",
                    name: "",
                    description: "",
                    user_ids: [],
                    is_create_manually: true,
                }
                : {
                    name: chat?.name || "",
                    description: chat?.description ?? "",
                    type: chat?.type || "private",
                    user_ids:
                        chat?.users
                            ?.filter((u) => u.is_active_member !== false)
                            .map((u) => u.id) ??
                        chat?.user_ids ??
                        [],
                    is_create_manually: true,
                },
    })

    const watchType = form.watch("type")
    const watchUserIds = form.watch("user_ids")

    const {
        options: usersOptionsRaw,
        isLoading: isLoadingUsers,
        setSearch: setUsersSearch,
        loadMore: loadMoreUsers,
        hasMore: hasMoreUsers,
    } = useUsersOptions()

    /**
     * IMPORTANT:
     * - selectedValues MUST still be resolvable from options,
     *   otherwise combobox can't display the selected label.
     *
     * So: we remove only current user + inactive users,
     * but we DO NOT remove watchUserIds from the options list.
     */
    const usersOptions = useMemo(() => {
        return usersOptionsRaw.filter(
            (u) => u.id !== currentUserId && !inactiveUserIds.includes(u.id)
        )
    }, [usersOptionsRaw, currentUserId, inactiveUserIds])

    const usersMap = useMemo(
        () => new Map(usersOptionsRaw.map((u) => [u.id, u.name])),
        [usersOptionsRaw]
    )

    const handleTypeChange = (type: "public" | "private") => {
        form.setValue("type", type, {shouldValidate: true})

        if (type === "public" && mode === "create") {
            form.setValue("is_create_manually", true)
        }

        // switching to private: ensure max 1 selected user
        if (type === "private") {
            const currentIds = form.getValues("user_ids")
            if (currentIds.length > 1) {
                form.setValue("user_ids", [currentIds[0]], {shouldValidate: true})
            }
        }
    }

    const handleFinalSubmit = async () => {
        const values = form.getValues()

        if (mode === "create") {
            const response = await chatService.createChat(values)
            if (response?.data?.id) setCreatedChatId(response.data.id)
            return response
        } else {
            if (!chat?.id) throw new Error("Chat ID is required for update")
            const response = await chatService.updateChat(chat.id, {
                ...values,
                user_ids: [...new Set([...values.user_ids, ...inactiveUserIds])],
            })
            return response
        }
    }

    const onSubmit = () => setDialogOpen(true)

    const handleSuccess = () => {
        triggerRefresh()
        onSuccessAction?.()
        if (mode === "create" && createdChatId) {
            router.push(`/chat/${createdChatId}`)
        }
    }

    return (
        <>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel className="text-sm">Name *</FormLabel>
                                <FormControl>
                                    <Input
                                        className="h-10 text-sm"
                                        placeholder="e.g. Design Team"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel className="text-sm">
                                    Description{" "}
                                    <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                                </FormLabel>
                                <FormControl>
                                    <Textarea
                                        className="text-sm min-h-20 resize-none"
                                        placeholder="What's this chat about?"
                                        {...field}
                                        value={field.value ?? ""}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    {/* Type toggle */}
                    <div className="space-y-1.5">
                        <p className="text-sm font-medium">Chat Type *</p>
                        <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg w-fit">
                            {(["private", "public"] as const).map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => handleTypeChange(t)}
                                    className={cn(
                                        "px-4 py-1.5 rounded-md text-xs font-medium transition-all capitalize",
                                        watchType === t
                                            ? "bg-white shadow-sm text-slate-800"
                                            : "text-slate-500 hover:text-slate-700"
                                    )}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {watchType === "private"
                                ? "1-on-1 conversation"
                                : "Group conversation — min. 2 members required"}
                        </p>
                    </div>

                    {/* User selection */}
                    <FormField
                        control={form.control}
                        name="user_ids"
                        render={({field, fieldState}) => (
                            <FormItem>
                                <FormLabel className="text-sm">
                                    Members *{" "}
                                    <span className="text-muted-foreground font-normal text-xs">
                    {watchType === "private" ? "(max 1)" : "(min 2)"}
                  </span>
                                </FormLabel>

                                <FormControl>
                                    <SearchableCombobox
                                        key={watchType} // reset internal state when switching mode (optional but helpful)
                                        options={usersOptions}
                                        selectedValues={field.value}
                                        onSelect={(userId) => {
                                            if (field.value.includes(userId)) return

                                            if (watchType === "private") {
                                                field.onChange([userId])
                                            } else {
                                                field.onChange([...field.value, userId])
                                            }
                                        }}
                                        onSearch={setUsersSearch}
                                        onLoadMore={loadMoreUsers}
                                        isLoading={isLoadingUsers}
                                        hasMore={hasMoreUsers}
                                        placeholder="Search users..."
                                        emptyMessage="No users found."
                                        className={cn(
                                            "w-full h-10 text-sm",
                                            fieldState.invalid &&
                                            "border border-red-500 focus:ring-red-500"
                                        )}
                                        mode={watchType === "private" ? "single" : "multiple"}
                                    />
                                </FormControl>

                                <FormMessage/>

                                {/* Badges: tampilkan hanya di public/multiple */}
                                {watchType !== "private" && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {field.value.map((userId) => (
                                            <TagBadge
                                                key={userId}
                                                label={usersMap.get(userId) || userId}
                                                onRemove={() =>
                                                    field.onChange(field.value.filter((id) => id !== userId))
                                                }
                                            />
                                        ))}

                                        {inactiveUserIds.map((userId) => {
                                            const name =
                                                chat?.users?.find((u) => u.id === userId)?.name || userId
                                            return (
                                                <span
                                                    key={userId}
                                                    title="This member has left the chat"
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-slate-100 text-slate-400 line-through"
                                                >
                          {name}
                                                    <span className="no-underline not-italic text-[10px]">
                            (left)
                          </span>
                        </span>
                                            )
                                        })}
                                    </div>
                                )}
                            </FormItem>
                        )}
                    />

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={onCancel}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-emerald-500 hover:bg-emerald-600 text-white"
                        >
                            {mode === "create" ? "Start Chat" : "Update Chat"}
                        </Button>
                    </div>
                </form>
            </Form>

            <ActionDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onConfirm={handleFinalSubmit}
                onContinue={handleSuccess}
                title={mode === "create" ? "Start New Chat?" : "Update Chat?"}
                description={
                    mode === "create"
                        ? "A new conversation will be created with the selected user(s)."
                        : "The chat information will be updated."
                }
                successTitle={mode === "create" ? "Chat Created!" : "Chat Updated!"}
                successDescription={
                    mode === "create"
                        ? "Your conversation is ready."
                        : "Your changes have been saved."
                }
                confirmText={mode === "create" ? "Start Chat" : "Update"}
                cancelText="Review Again"
            />
        </>
    )
}