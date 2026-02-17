"use client"

import {ChangeEvent, useEffect, useMemo, useRef, useState} from "react"
import {useForm} from "react-hook-form"
import {Card, CardContent} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {Input} from "@/components/ui/input"
import {Textarea} from "@/components/ui/textarea"
import {Icon} from "@iconify/react";
import {TagBadge} from "@/components/badge/TagBadge";
import {openAttachment, uploadAttachment} from "@/lib/attachment-helpers";
import {useTagsOptions, useUsersOptions} from "@/hooks/useFilterOptions";
import {SearchableCombobox} from "@/components/combobox/SearchableCombobox";
import {useRouter} from "next/navigation";
import {zodResolver} from "@hookform/resolvers/zod";
import {ActionDialog} from "@/components/dialog/ActionDialog";
import {Attachment} from "@/types/attachment";
import {CreateCommunityInput, CreateCommunitySchema} from "@/schemas/community.schema";
import {communityService} from "@/services/communityService";
import {useSession} from "next-auth/react";

type CommunityFormProps = {
    mode: "create" | "edit"
    communityId?: string
}

export default function CommunityForm({mode, communityId}: CommunityFormProps) {
    const isEditMode = mode === "edit"
    const { data: session } = useSession()

    const router = useRouter()
    const [profileFile, setProfileFile] = useState<File | undefined>()
    const [isLoadingDetail, setIsLoadingDetail] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    const {
        options: communityTags,
        isLoading: isLoadingCommunityTags,
        setSearch: setCommunitySearch,
        loadMore: loadMoreCommunityTags,
        hasMore: hasMoreCommunityTags
    } = useTagsOptions("community");

    const {
        options: usersOptions,
        isLoading: isLoadingUsersOptions,
        setSearch: setUsersOptionsSearch,
        loadMore: loadMoreUsersOptions,
        hasMore: hasMoreUsersOptions
    } = useUsersOptions();

    const form = useForm({
        resolver: zodResolver(CreateCommunitySchema),
        defaultValues: {
            name: "",
            website: "",
            attachment_id: undefined,
            description: "",
            tag_ids: [],
            admin_ids: [],
            address: {
                street: "",
                city: "",
                state: "",
                zip_code: "",
                country: "",
                notes: "",
                link: "",
            },
        },
    })

    const [currentCommunityId, setCurrentCommunityId] = useState<string | undefined>(communityId);

    async function handleFinalSubmit() {
        const values = form.getValues()

        const uploadedProfileId = profileFile ? await uploadAttachment(profileFile, true) : undefined

        const payload: CreateCommunityInput = {
            ...values,
            attachment_id: uploadedProfileId ?? values.attachment_id,
        }

        let response

        if (!isEditMode) {
            response = await communityService.createCommunity(payload)

            if (response?.data?.id) {
                setCurrentCommunityId(response.data.id);
            }
        } else {
            if (!currentCommunityId) {
                throw new Error("Community ID is missing in edit mode.");
            }

            response = await communityService.updateCommunity(currentCommunityId, payload);
        }

        return response;
    }

    function onSubmit() {
        console.log("submit triggered")
        setDialogOpen(true)
    }

    const handleProfileUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files?.length) return

        const file = files[0]

        if (file.size > 5 * 1024 * 1024) {
            form.setError("attachment_id", {
                type: "manual",
                message: "File size must be less than 5MB"
            })
            return
        }

        if (!file.type.startsWith("image/")) {
            form.setError("attachment_id", {
                type: "manual",
                message: "Only image files are allowed"
            })
            return
        }

        const url = URL.createObjectURL(file)
        setPreviewUrl(url)
        setProfileFile(file)
        form.clearErrors("attachment_id")
    }


    const removeProfileFile = () => {
        setProfileFile(undefined)

        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const removeExistingProfilePicture = () => {
        setExistingProfilePicture(undefined)
        form.setValue("attachment_id", undefined)

        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
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

    const communityTagsMap = useMemo(
        () => new Map(communityTags.map(tag => [tag.id, tag.name])),
        [communityTags]
    )

    const userAdminMap = useMemo(
        () => new Map(usersOptions.map(user => [user.id, user.email])),
        [usersOptions]
    )

    const [existingProfilePicture, setExistingProfilePicture] = useState<{
        id: string;
        filename?: string;
        mime_type?: string
    }>()

    const [downloadingId, setDownloadingId] = useState<string | null>(null)

    const handleOpenNewFile = (file: File) => {
        const fileUrl = URL.createObjectURL(file)
        window.open(fileUrl, "_blank")

        setTimeout(() => URL.revokeObjectURL(fileUrl), 1000)
    }

    useEffect(() => {
        if (!isEditMode || !communityId) return

        const fetchDetail = async () => {
            setIsLoadingDetail(true)

            try {
                const res = await communityService.getCommunityById(communityId || "")

                form.reset({
                    name: res.name,
                    website: res.website ?? "",
                    description: res.description,
                    tag_ids: res.tags?.map(t => t.id) ?? [],
                    attachment_id: res.attachment?.id ?? undefined,
                    admin_ids: res.admins.map(t => t.id) ?? [],
                    address: {
                        street: res.address?.street ?? "",
                        city: res.address?.city ?? "",
                        state: res.address?.state ?? "",
                        zip_code: res.address?.zip_code ?? "",
                        country: res.address?.country ?? "",
                        notes: res.address?.notes || undefined,
                        link: res.address?.link || undefined,
                    },
                })

                if (res.attachment) {
                    setExistingProfilePicture({
                        id: res.attachment.id,
                        mime_type: res.attachment.mime_type,
                        filename: res.attachment.filename ?? "Existing Image",
                    })
                } else {
                    setExistingProfilePicture(undefined)
                }
            } catch (err) {
                console.error("Failed to fetch community data:", err)
            } finally {
                setIsLoadingDetail(false)
            }
        }

        fetchDetail()
    }, [form, isEditMode, communityId])

    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement | null>(null)

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl)
            }
        }
    }, [previewUrl])

    if (isEditMode && isLoadingDetail) {
        return (
            <div className="p-10 text-center bg-green-50 py-12 px-4">
                <Icon icon="ph:circle-notch" className="w-8 h-8 animate-spin mx-auto mb-4"/>
                <p>Loading community data...</p>
            </div>
        )
    }

    return (
        <>
            <div>
                <div className="max-w-6xl mx-auto">
                    <Card className="rounded-2xl shadow-xl p-0 m-0">
                        <CardContent className="p-10">
                            <Form {...form}>
                                <form
                                    onSubmit={form.handleSubmit(
                                        onSubmit,
                                        (errors) => {
                                            console.log("Validation errors:", errors)
                                        })}
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        {/* LEFT COLUMN */}
                                        <div className="space-y-6">
                                            <h3 className="text-xl font-semibold mb-6 border-b pb-2">
                                                {isEditMode ? "Edit Community Information" : "Community Information"}
                                            </h3>
                                            <FormField
                                                control={form.control}
                                                name="name"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel>Name *</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="e.g. Buddy" {...field} />
                                                        </FormControl>
                                                        <FormMessage/>
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="website"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel>Website</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="e.g. https://pawsite.com" {...field} />
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
                                                        <FormLabel>Description *</FormLabel>
                                                        <FormControl>
                                                            <Textarea
                                                                placeholder="Describe the community, its mission, and what makes it unique..."
                                                                className="min-h-30"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage/>
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="tag_ids"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel>Tags</FormLabel>
                                                        <FormControl>
                                                            <SearchableCombobox
                                                                options={communityTags}
                                                                selectedValues={field.value}
                                                                onSelect={(tagId) => {
                                                                    if (!field.value.includes(tagId)) {
                                                                        field.onChange([...field.value, tagId]);
                                                                    }
                                                                }}
                                                                onSearch={setCommunitySearch}
                                                                onLoadMore={loadMoreCommunityTags}
                                                                isLoading={isLoadingCommunityTags}
                                                                hasMore={hasMoreCommunityTags}
                                                                placeholder="Select tags..."
                                                                emptyMessage="No tags found."
                                                                mode={"multiple"}
                                                            />
                                                        </FormControl>
                                                        <FormMessage/>
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            {field.value.map(tagId => (
                                                                <TagBadge
                                                                    key={tagId}
                                                                    label={communityTagsMap.get(tagId) || tagId}
                                                                    onRemove={() => {
                                                                        const updated = field.value.filter(id => id !== tagId);
                                                                        field.onChange(updated);
                                                                    }}
                                                                />
                                                            ))}
                                                        </div>
                                                    </FormItem>
                                                )}
                                            />

                                            <h3 className="text-xl font-semibold mb-6 border-b pb-2">Address
                                                *</h3>
                                            <FormField
                                                control={form.control}
                                                name="address.street"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel>Street *</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="e.g. 123 Main St" {...field} />
                                                        </FormControl>
                                                        <FormMessage/>
                                                    </FormItem>
                                                )}
                                            />

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                                <FormField
                                                    control={form.control}
                                                    name="address.city"
                                                    render={({field}) => (
                                                        <FormItem>
                                                            <FormLabel>City *</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="e.g. Springfield" {...field} />
                                                            </FormControl>
                                                            <FormMessage/>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="address.state"
                                                    render={({field}) => (
                                                        <FormItem>
                                                            <FormLabel>State *</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="e.g. Illinois" {...field} />
                                                            </FormControl>
                                                            <FormMessage/>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                                <FormField
                                                    control={form.control}
                                                    name="address.zip_code"
                                                    render={({field}) => (
                                                        <FormItem>
                                                            <FormLabel>Zip Code *</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="e.g. 62704" {...field} />
                                                            </FormControl>
                                                            <FormMessage/>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="address.country"
                                                    render={({field}) => (
                                                        <FormItem>
                                                            <FormLabel>Country *</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="e.g. USA" {...field} />
                                                            </FormControl>
                                                            <FormMessage/>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <FormField
                                                control={form.control}
                                                name="address.link"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel>Link</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="e.g. https://pawsite.com" {...field} />
                                                        </FormControl>
                                                        <FormMessage/>
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="address.notes"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel>Notes</FormLabel>
                                                        <FormControl>
                                                            <Textarea
                                                                placeholder="Describe the address in more detail..."
                                                                className="min-h-30"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage/>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        {/* RIGHT COLUMN */}
                                        <div className="space-y-8">
                                            <div>
                                                <h3 className="text-xl font-semibold mb-6 border-b pb-2">Profile Picture</h3>
                                                <div
                                                    className="border-2 border-dashed border-[#E0E0E0] rounded-lg p-8 flex flex-col items-center justify-center">
                                                    <Icon icon="ph:camera" className="w-12 h-12 text-[#BDBDBD] mb-3"/>
                                                    <p className="font-medium text-[#424242] text-sm">Upload Profile
                                                        Picture</p>
                                                    <p className="text-xs text-[#757575] mb-4 mt-1">PNG, JPG, GIF (MAX.
                                                        800x800px)</p>
                                                    <label htmlFor="profile-upload">
                                                        <Button type="button" variant="outline"
                                                                className="px-6 h-9 rounded-md border-[#E0E0E0] text-sm cursor-pointer"
                                                                asChild>
                                                            <span>Select File</span>
                                                        </Button>
                                                    </label>
                                                    <input
                                                        ref={fileInputRef}
                                                        id="profile-upload"
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={handleProfileUpload}
                                                    />
                                                </div>

                                                <p className="text-xs text-[#757575] mt-3">A great profile picture is
                                                    key to
                                                    finding a new home.</p>

                                                {/* EXISTING FILE */}
                                                {existingProfilePicture && !profileFile && (
                                                    <div
                                                        className="mt-3 flex items-center justify-between p-3 border border-[#E0E0E0] rounded-md text-sm">
                                                        <span
                                                            onClick={() => handleOpenExistingFile(existingProfilePicture as Attachment)}
                                                            className="truncate flex-1 cursor-pointer hover:underline flex items-center gap-2"
                                                        >
                                                            {downloadingId === existingProfilePicture.id && (
                                                                <Icon icon="ph:spinner"
                                                                      className="w-4 h-4 animate-spin shrink-0"/>
                                                            )}
                                                            {existingProfilePicture.filename}
                                                        </span>
                                                        <Icon
                                                            icon="ph:trash"
                                                            className="w-4 h-4 text-[#F44336] cursor-pointer ml-2 shrink-0 hover:text-[#D32F2F]"
                                                            onClick={removeExistingProfilePicture}
                                                        />
                                                    </div>
                                                )}

                                                {/* NEW FILE */}
                                                {profileFile && (
                                                    <div
                                                        className="mt-3 flex items-center justify-between p-3 border border-green-300 bg-green-50 rounded-md text-sm">
                                                        <span
                                                            onClick={() => handleOpenNewFile(profileFile)}
                                                            className="truncate flex-1 cursor-pointer hover:underline text-green-700"
                                                        >
                                                            {profileFile.name}
                                                        </span>
                                                        <Icon
                                                            icon="ph:trash"
                                                            className="w-4 h-4 text-[#F44336] cursor-pointer ml-2 shrink-0 hover:text-[#D32F2F]"
                                                            onClick={removeProfileFile}
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <h3 className="text-xl font-semibold mb-6 border-b pb-2">Community Admin</h3>
                                                <FormField
                                                    control={form.control}
                                                    name="admin_ids"
                                                    render={({field}) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <SearchableCombobox
                                                                    options={usersOptions}
                                                                    selectedValues={field.value || []}
                                                                    onSelect={(userId) => {
                                                                        if (!field.value?.includes(userId)) {
                                                                            field.onChange([...field.value || [], userId]);
                                                                        }
                                                                    }}
                                                                    onSearch={setUsersOptionsSearch}
                                                                    onLoadMore={loadMoreUsersOptions}
                                                                    isLoading={isLoadingUsersOptions}
                                                                    hasMore={hasMoreUsersOptions}
                                                                    placeholder="Select admins..."
                                                                    emptyMessage="No users found."
                                                                    mode={"multiple"}
                                                                />
                                                            </FormControl>
                                                            <FormMessage/>
                                                            <div className="flex flex-wrap gap-2 mt-2">
                                                                {field.value?.map(userId => {
                                                                    const isSelf = userId === session?.user?.id
                                                                    return (
                                                                        <TagBadge
                                                                            key={userId}
                                                                            label={userAdminMap.get(userId) || userId}
                                                                            disabled={isSelf}
                                                                            onRemove={() => {
                                                                                const updated = field.value?.filter(id => id !== userId)
                                                                                field.onChange(updated)
                                                                            }}
                                                                        />
                                                                    )
                                                                })}
                                                            </div>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-10 space-y-4 flex flex-wrap justify-end border-t pt-6">
                                        <Button type="submit"
                                                className="mt-4 bg-green-600 hover:bg-green-700 text-white">
                                            {isEditMode ? "Update Community Profile" : "Submit new community profile"}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <ActionDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onConfirm={handleFinalSubmit}
                onContinue={() =>
                    router.push(currentCommunityId ? `/communities/${currentCommunityId}` : "/communities")
                }
                title={isEditMode ? "Update Community Profile?" : "Create Community Profile?"}
                description="Please review the community's information before continuing."
                successTitle={isEditMode
                    ? "Community Profile Updated Successfully"
                    : "Community Profile Created Successfully"}
                successDescription="Your community profile is now live."
                confirmText={isEditMode ? "Update Profile" : "Create Profile"}
                cancelText="Review Again"
            />
        </>
    )
}