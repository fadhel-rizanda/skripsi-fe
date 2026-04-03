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
import {
    useTagsOptions,
    useUsersOptions,
    useProvincesOptions,
    useRegenciesOptions,
    useDistrictsOptions,
} from "@/hooks/useFilterOptions";
import {SearchableCombobox} from "@/components/combobox/SearchableCombobox";
import {useRouter} from "next/navigation";
import {zodResolver} from "@hookform/resolvers/zod";
import {ActionDialog} from "@/components/dialog/ActionDialog";
import {Attachment} from "@/types/attachment";
import {CreateCommunityInput, CreateCommunitySchema} from "@/schemas/community.schema";
import {communityService} from "@/services/communityService";
import {useSession} from "next-auth/react";
import {cn} from "@/lib/utils";
import {Home, MapPin} from "lucide-react";
import {TAG_TYPE} from "@/constant/tag-type";

type CommunityFormProps = {
    mode: "create" | "edit"
    communityId?: string
    onSuccess?: () => void
}

export default function CommunityForm({mode, communityId, onSuccess}: CommunityFormProps) {
    const isEditMode = mode === "edit"
    const {data: session} = useSession()

    const router = useRouter()
    const [profileFile, setProfileFile] = useState<File | undefined>()
    const [isLoadingDetail, setIsLoadingDetail] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [useOwnerAddress, setUseOwnerAddress] = useState(false)

    const {
        options: communityTags,
        isLoading: isLoadingCommunityTags,
        setSearch: setCommunitySearch,
        loadMore: loadMoreCommunityTags,
        hasMore: hasMoreCommunityTags
    } = useTagsOptions(TAG_TYPE.COMMUNITY);

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
            website: undefined,
            attachment_id: undefined,
            description: "",
            tag_ids: [],
            admin_ids: [],
            use_owner_address: false,
            address: {
                street: "",
                province_id: "",
                regency_id: "",
                district_id: "",
                zip_code: "",
                notes: "",
                link: "",
            },
        },
    })

    const selectedProvinceId = form.watch("address.province_id")
    const selectedRegencyId = form.watch("address.regency_id")

    const {
        options: provinces,
        isLoading: isLoadingProvinces,
        setSearch: setProvincesSearch,
        loadMore: loadMoreProvinces,
        hasMore: hasMoreProvinces,
    } = useProvincesOptions()

    const {
        options: regencies,
        isLoading: isLoadingRegencies,
        setSearch: setRegenciesSearch,
        loadMore: loadMoreRegencies,
        hasMore: hasMoreRegencies,
    } = useRegenciesOptions(selectedProvinceId ?? "")

    const {
        options: districts,
        isLoading: isLoadingDistricts,
        setSearch: setDistrictsSearch,
        loadMore: loadMoreDistricts,
        hasMore: hasMoreDistricts,
    } = useDistrictsOptions(selectedRegencyId ?? "")

    const [initialProvince, setInitialProvince] = useState<{id: string, name: string} | null>(null)
    const [initialRegency, setInitialRegency] = useState<{id: string, name: string} | null>(null)
    const [initialDistrict, setInitialDistrict] = useState<{id: string, name: string} | null>(null)

    const [currentCommunityId, setCurrentCommunityId] = useState<string | undefined>(communityId);

    const handleToggleOwnerAddress = (useOwner: boolean) => {
        setUseOwnerAddress(useOwner)
        form.setValue("use_owner_address", useOwner, {shouldValidate: true})
        if (useOwner) {
            form.clearErrors("address")
        }
    }

    async function handleFinalSubmit() {
        const values = form.getValues()

        const uploadedProfileId = profileFile ? await uploadAttachment(profileFile, true) : undefined

        const payload: CreateCommunityInput = {
            ...values,
            attachment_id: uploadedProfileId ?? values.attachment_id,
            ...(!isEditMode
                    ? {
                        use_owner_address: useOwnerAddress,
                        ...(useOwnerAddress ? {} : {address: values.address}),
                    }
                    : {
                        use_owner_address: false,
                        address: values.address,
                    }
            ),
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
        setDialogOpen(true)
    }

    const handleProfileUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files?.length) return

        const file = files[0]

        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
        if (!allowedTypes.includes(file.type)) {
            form.setError("attachment_id", {
                type: "manual",
                message: "Only JPEG, PNG, GIF, or WebP images are allowed"
            })
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            form.setError("attachment_id", {
                type: "manual",
                message: "File size must be less than 5MB"
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

    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement | null>(null)

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl)
        }
    }, [previewUrl])

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
                    use_owner_address: false,
                    address: {
                        street: res.address?.street ?? "",
                        province_id: res.address?.province_id ?? res.address?.province?.id ?? "",
                        regency_id: res.address?.regency_id ?? res.address?.regency?.id ?? "",
                        district_id: res.address?.district_id ?? res.address?.district?.id ?? "",
                        zip_code: res.address?.zip_code ?? "",
                        notes: res.address?.notes ?? "",
                        link: res.address?.link ?? "",
                    },
                })

                if (res.address?.province) {
                    setInitialProvince({id: String(res.address.province.id), name: res.address.province.name})
                }
                if (res.address?.regency) {
                    setInitialRegency({id: String(res.address.regency.id), name: res.address.regency.name})
                }
                if (res.address?.district) {
                    setInitialDistrict({id: String(res.address.district.id), name: res.address.district.name})
                }

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

    if (isEditMode && isLoadingDetail) {
        return (
            <div className="p-10 text-center bg-green-50 py-12 px-4">
                <Icon icon="ph:circle-notch" className="w-8 h-8 animate-spin mx-auto mb-4"/>
                <p>Loading community data...</p>
            </div>
        )
    }

    const renderAddressFields = () => (
        <>
            <FormField
                control={form.control}
                name="address.street"
                render={({field}) => (
                    <FormItem>
                        <FormLabel className="text-xs sm:text-sm">Street *</FormLabel>
                        <FormControl>
                            <Input className="h-9 sm:h-10 text-xs sm:text-sm" placeholder="e.g. Jl. Pawsitive No. 123" {...field} />
                        </FormControl>
                        <FormMessage/>
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="address.province_id"
                render={({field, fieldState}) => (
                    <FormItem>
                        <FormLabel className="text-xs sm:text-sm">Province *</FormLabel>
                        <FormControl>
                            <SearchableCombobox
                                options={[
                                    ...(initialProvince && !provinces.find(p => p.id === initialProvince.id) ? [initialProvince] : []),
                                    ...provinces,
                                ]}
                                selectedValues={field.value ? [field.value] : []}
                                onSelect={(value) => {
                                    field.onChange(value)
                                    form.setValue("address.regency_id", "")
                                    form.setValue("address.district_id", "")
                                    setInitialRegency(null)
                                    setInitialDistrict(null)
                                }}
                                onSearch={setProvincesSearch}
                                onLoadMore={loadMoreProvinces}
                                isLoading={isLoadingProvinces}
                                hasMore={hasMoreProvinces}
                                placeholder="Select province..."
                                emptyMessage="No provinces found."
                                className={cn(
                                    "w-full h-9 sm:h-10 text-xs sm:text-sm",
                                    fieldState.invalid && "border border-red-500 focus:ring-red-500"
                                )}
                                mode="single"
                            />
                        </FormControl>
                        <FormMessage/>
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="address.regency_id"
                render={({field, fieldState}) => (
                    <FormItem>
                        <FormLabel className="text-xs sm:text-sm">Regency / City *</FormLabel>
                        <FormControl>
                            <SearchableCombobox
                                options={[
                                    ...(initialRegency && !regencies.find(r => r.id === initialRegency.id) ? [initialRegency] : []),
                                    ...regencies,
                                ]}
                                selectedValues={field.value ? [field.value] : []}
                                onSelect={(value) => {
                                    field.onChange(value)
                                    form.setValue("address.district_id", "")
                                    setInitialDistrict(null)
                                }}
                                onSearch={setRegenciesSearch}
                                onLoadMore={loadMoreRegencies}
                                isLoading={isLoadingRegencies}
                                hasMore={hasMoreRegencies}
                                placeholder={selectedProvinceId ? "Select regency/city..." : "Select a province first"}
                                emptyMessage="No regencies found."
                                className={
                                    "w-full h-9 sm:h-10 text-xs sm:text-sm " +
                                    (fieldState.invalid ? 'border border-red-500 focus:ring-red-500' : '')
                                }
                                mode="single"
                                disabled={!selectedProvinceId}
                            />
                        </FormControl>
                        <FormMessage/>
                    </FormItem>
                )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="address.district_id"
                    render={({field, fieldState}) => (
                        <FormItem>
                            <FormLabel className="text-xs sm:text-sm">District *</FormLabel>
                            <FormControl>
                                <SearchableCombobox
                                    options={[
                                        ...(initialDistrict && !districts.find(d => d.id === initialDistrict.id) ? [initialDistrict] : []),
                                        ...districts,
                                    ]}
                                    selectedValues={field.value ? [field.value] : []}
                                    onSelect={(value) => field.onChange(value)}
                                    onSearch={setDistrictsSearch}
                                    onLoadMore={loadMoreDistricts}
                                    isLoading={isLoadingDistricts}
                                    hasMore={hasMoreDistricts}
                                    placeholder={selectedRegencyId ? "Select district..." : "Select a regency first"}
                                    emptyMessage="No districts found."
                                    className={
                                        "w-full h-9 sm:h-10 text-xs sm:text-sm " +
                                        (fieldState.invalid ? 'border border-red-500 focus:ring-red-500' : '')
                                    }
                                    mode="single"
                                    disabled={!selectedRegencyId}
                                />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="address.zip_code"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel className="text-xs sm:text-sm">Zip Code <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                            <FormControl>
                                <Input className="h-9 sm:h-10 text-xs sm:text-sm" placeholder="e.g. 62704" {...field} />
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
                        <FormLabel className="text-xs sm:text-sm">Maps Link <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                        <FormControl>
                            <Input className="h-9 sm:h-10 text-xs sm:text-sm" placeholder="e.g. https://maps.google.com/..." {...field} />
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
                        <FormLabel className="text-xs sm:text-sm">Notes <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                        <FormControl>
                            <Textarea placeholder="Describe the address in more detail..." className="min-h-24 sm:min-h-30 text-xs sm:text-sm" {...field} />
                        </FormControl>
                        <FormMessage/>
                    </FormItem>
                )}
            />
        </>
    )

    const renderAddressSection = () => {
        if (isEditMode) {
            return (
                <>
                    <h3 className="text-xl font-semibold border-b pb-2">Address *</h3>
                    {renderAddressFields()}
                </>
            )
        }

        return (
            <>
                <div className="flex items-center justify-between border-b pb-2">
                    <h3 className="text-xl font-semibold">Address *</h3>
                    <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg">
                        <button
                            type="button"
                            onClick={() => handleToggleOwnerAddress(true)}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all",
                                useOwnerAddress ? "bg-white shadow-sm text-slate-800" : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            <Home className="h-3.5 w-3.5"/>
                            Same as mine
                        </button>
                        <button
                            type="button"
                            onClick={() => handleToggleOwnerAddress(false)}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all",
                                !useOwnerAddress ? "bg-white shadow-sm text-slate-800" : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            <MapPin className="h-3.5 w-3.5"/>
                            Custom
                        </button>
                    </div>
                </div>

                {useOwnerAddress ? (
                    <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600">
                        <Home className="h-4 w-4 shrink-0 text-slate-400"/>
                        <p>Community location will use your registered address.</p>
                    </div>
                ) : (
                    renderAddressFields()
                )}
            </>
        )
    }

    return (
        <>
            <div>
                <div className="max-w-6xl mx-auto">
                    <Card className="rounded-2xl shadow-xl p-0 m-0">
                        <CardContent className="p-4 sm:p-10">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
                                    if (useOwnerAddress) {
                                        const nonAddressErrors = Object.keys(errors).filter(k => k !== "address")
                                        if (nonAddressErrors.length === 0) {
                                            onSubmit()
                                        }
                                    }
                                })}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
                                        {/* LEFT COLUMN */}
                                        <div className="space-y-5 sm:space-y-6">
                                            <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 border-b pb-2">
                                                {isEditMode ? "Edit Community Information" : "Community Information"}
                                            </h3>

                                            <FormField
                                                control={form.control}
                                                name="name"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs sm:text-sm">Name *</FormLabel>
                                                        <FormControl>
                                                            <Input className="h-9 sm:h-10 text-xs sm:text-sm" placeholder="e.g. Pawsitive Community" {...field} />
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
                                                        <FormLabel className="text-xs sm:text-sm">Website</FormLabel>
                                                        <FormControl>
                                                            <Input className="h-9 sm:h-10 text-xs sm:text-sm" placeholder="e.g. https://pawsite.com" {...field} />
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
                                                        <FormLabel className="text-xs sm:text-sm">Description *</FormLabel>
                                                        <FormControl>
                                                            <Textarea
                                                                placeholder="Describe the community, its mission, and what makes it unique..."
                                                                className="min-h-24 sm:min-h-30 text-xs sm:text-sm"
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
                                                render={({field, fieldState}) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs sm:text-sm">Tags *</FormLabel>
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
                                                                className={
                                                                    "w-full h-9 sm:h-10 text-xs sm:text-sm " +
                                                                    (fieldState.invalid ? 'border border-red-500 focus:ring-red-500' : '')
                                                                }
                                                                mode={"multiple"}
                                                            />
                                                        </FormControl>
                                                        <FormMessage/>
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            {field.value.map(tagId => (
                                                                <TagBadge
                                                                    key={tagId}
                                                                    label={communityTagsMap.get(tagId) || tagId}
                                                                    onRemove={() => field.onChange(field.value.filter(id => id !== tagId))}
                                                                />
                                                            ))}
                                                        </div>
                                                    </FormItem>
                                                )}
                                            />

                                            {renderAddressSection()}
                                        </div>

                                        {/* RIGHT COLUMN */}
                                        <div className="space-y-6 sm:space-y-8">
                                            <div>
                                                <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 border-b pb-2">Profile Picture</h3>
                                                <div className="border-2 border-dashed border-[#E0E0E0] rounded-lg p-8 flex flex-col items-center justify-center">
                                                    <Icon icon="ph:camera" className="w-12 h-12 text-[#BDBDBD] mb-3"/>
                                                    <p className="font-medium text-[#424242] text-sm">Upload Profile Picture</p>
                                                    <p className="text-xs text-[#757575] mb-4 mt-1">PNG, JPG, GIF (MAX. 800x800px)</p>
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
                                                        accept="image/jpeg,image/png,image/gif,image/webp"
                                                        onChange={handleProfileUpload}
                                                    />
                                                </div>
                                                <p className="text-xs text-[#757575] mt-3">A great profile picture helps your community stand out.</p>

                                                {existingProfilePicture && !profileFile && (
                                                    <div className="mt-3 flex items-center justify-between p-3 border border-[#E0E0E0] rounded-md text-sm">
                                                        <span
                                                            onClick={() => handleOpenExistingFile(existingProfilePicture as Attachment)}
                                                            className="truncate flex-1 cursor-pointer hover:underline flex items-center gap-2"
                                                        >
                                                            {downloadingId === existingProfilePicture.id && (
                                                                <Icon icon="ph:spinner" className="w-4 h-4 animate-spin shrink-0"/>
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

                                                {profileFile && (
                                                    <div className="mt-3 flex items-center justify-between p-3 border border-green-300 bg-green-50 rounded-md text-sm">
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
                                                <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 border-b pb-2">Community Admin</h3>
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
                                                                    className="w-full h-9 sm:h-10 text-xs sm:text-sm"
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
                                                                            onRemove={() => field.onChange(field.value?.filter(id => id !== userId))}
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

                                    <div className="mt-6 sm:mt-10 space-y-4 flex flex-wrap justify-end border-t pt-4 sm:pt-6">
                                        <Button type="submit" className="mt-4 bg-green-600 hover:bg-green-700 text-white">
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
                onContinue={() => {
                    onSuccess?.();

                    router.push(
                        currentCommunityId
                            ? `/explore/communities/${currentCommunityId}`
                            : "/explore/communities",
                    );
                }}
                title={isEditMode ? "Update Community Profile?" : "Create Community Profile?"}
                description="Please review the community's information before continuing."
                successTitle={isEditMode ? "Community Profile Updated Successfully" : "Community Profile Created Successfully"}
                successDescription="Your community profile is now live."
                confirmText={isEditMode ? "Update Profile" : "Create Profile"}
                cancelText="Review Again"
            />
        </>
    )
}