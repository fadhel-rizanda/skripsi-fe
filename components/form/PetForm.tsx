"use client"

import {ChangeEvent, useEffect, useMemo, useRef, useState} from "react"
import {useForm} from "react-hook-form"
import {format} from "date-fns"
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
import {Checkbox} from "@/components/ui/checkbox"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Calendar} from "@/components/ui/calendar";
import {Icon} from "@iconify/react";
import {TagBadge} from "@/components/badge/TagBadge";
import {openAttachment, uploadAttachment} from "@/lib/attachment-helpers";
import {CreatePetSchema} from "@/schemas/pet.schema";
import {CreatePetPayload, petService} from "@/services/petServices";
import {useTagsOptions, useProvincesOptions, useRegenciesOptions, useDistrictsOptions} from "@/hooks/useFilterOptions";
import {SearchableCombobox} from "@/components/combobox/SearchableCombobox";
import {useRouter} from "next/navigation";
import {zodResolver} from "@hookform/resolvers/zod";
import {ActionDialog} from "@/components/dialog/ActionDialog";
import {genderOptions, PetGender, PetSize, sizeOptions} from "@/types/pet";
import {Attachment} from "@/types/attachment";
import {cn} from "@/lib/utils";
import {Home, MapPin} from "lucide-react";
import {TAG_TYPE} from "@/constant/tag-type";

type PetFormProps = {
    mode: "create" | "edit"
    petId?: string
}

const sizeComboboxOptions = sizeOptions.map((value) => ({
    id: value,
    name: value.charAt(0).toUpperCase() + value.slice(1),
}))

const genderComboboxOptions = genderOptions.map((value) => ({
    id: value,
    name: value.charAt(0).toUpperCase() + value.slice(1),
}))

export default function PetForm({mode, petId}: PetFormProps) {
    const isEditMode = mode === "edit"

    const router = useRouter()
    const [profileFiles, setProfileFiles] = useState<File[]>([])
    const [additionalFiles, setAdditionalFiles] = useState<File[]>([])
    const [isLoadingDetail, setIsLoadingDetail] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [useOwnerAddress, setUseOwnerAddress] = useState(false)

    const {
        options: physiqueTags,
        isLoading: isLoadingPhysiqueTags,
        setSearch: setPhysiqueSearch,
        loadMore: loadMorePhysique,
        hasMore: hasMorePhysique
    } = useTagsOptions(TAG_TYPE.PET.PHYSIQUE);

    const {
        options: personalityTags,
        isLoading: isLoadingPersonalityTags,
        setSearch: setPersonalitySearch,
        loadMore: loadMorePersonality,
        hasMore: hasMorePersonality
    } = useTagsOptions(TAG_TYPE.PET.PERSONALITY);

    const {
        options: typeTags,
        isLoading: isLoadingTypeTags,
        setSearch: setTypeSearch,
        loadMore: loadMoreType,
        hasMore: hasMoreType
    } = useTagsOptions(TAG_TYPE.GENERAL.TYPE_OF_ANIMAL);

    const form = useForm({
        resolver: zodResolver(CreatePetSchema),
        defaultValues: {
            name: "",
            breed: "",
            size: undefined,
            date_of_birth: undefined,
            gender: undefined,
            about: "",
            special_needs: false,
            type_of_animal_id: "",
            profile_picture_ids: [],
            physique_ids: [],
            personality_ids: [],
            additional_record_ids: [],
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

    const [currentPetId, setCurrentPetId] = useState<string | undefined>(petId);

    const handleToggleOwnerAddress = (useOwner: boolean) => {
        setUseOwnerAddress(useOwner)
        form.setValue("use_owner_address", useOwner, { shouldValidate: true })
        if (useOwner) {
            form.setValue("address.street", "")
            form.setValue("address.province_id", "")
            form.setValue("address.regency_id", "")
            form.setValue("address.district_id", "")
            form.setValue("address.zip_code", "")
            form.setValue("address.notes", "")
            form.setValue("address.link", "")
            form.clearErrors("address")
        }
    }

    async function handleFinalSubmit() {
        const values = form.getValues();

        const uploadedProfileIds =
            profileFiles.length > 0
                ? await Promise.all(profileFiles.map(file => uploadAttachment(file, true)))
                : [];

        const uploadedAdditionalIds =
            additionalFiles.length > 0
                ? await Promise.all(additionalFiles.map(file => uploadAttachment(file)))
                : [];

        const payload: CreatePetPayload = {
            ...values,
            date_of_birth: values.date_of_birth.toISOString(),
            profile_picture_ids: [
                ...(values.profile_picture_ids ?? []),
                ...uploadedProfileIds,
            ],
            special_needs: values.special_needs ?? false,
            additional_record_ids: [
                ...(values.additional_record_ids ?? []),
                ...uploadedAdditionalIds,
            ],
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
        };

        let response;

        if (!isEditMode) {
            response = await petService.createPet(payload);
            if (response?.data?.id) {
                setCurrentPetId(response.data.id);
            }
        } else {
            if (!currentPetId) throw new Error("Pet ID is missing in edit mode.");
            response = await petService.updatePet(currentPetId, payload);
        }

        return response;
    }

    function onSubmit() {
        setIsSubmitted(true)
        const totalProfilePictures = profileFiles.length + existingProfilePictures.length
        if (totalProfilePictures === 0) return
        setDialogOpen(true)
    }

    const handleProfileUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files) return

        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
        const maxSize = 5 * 1024 * 1024
        const maxFiles = 10

        const validFiles = Array.from(files).filter(file => {
            if (!allowedTypes.includes(file.type)) return false
            return file.size <= maxSize;

        })

        if (profileFiles.length + validFiles.length > maxFiles) {
            alert("Maximum 10 profile pictures allowed")
            return
        }

        setProfileFiles([...profileFiles, ...validFiles])
        setIsSubmitted(true)
        e.target.value = ""
    }

    const handleAdditionalUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files) return

        const allowedTypes = [
            "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp",
            "application/pdf",
            "video/mp4", "video/quicktime",
        ]
        const maxSize = 10 * 1024 * 1024

        const validFiles = Array.from(files).filter(file =>
            allowedTypes.includes(file.type) && file.size <= maxSize
        )

        setAdditionalFiles([...additionalFiles, ...validFiles])
        e.target.value = ""
    }

    const removeProfileFile = (index: number) => {
        setProfileFiles(prev => prev.filter((_, i) => i !== index))
        if (profileInputRef.current) profileInputRef.current.value = ""
    }

    const removeAdditionalFile = (index: number) => {
        setAdditionalFiles(prev => prev.filter((_, i) => i !== index))
        if (additionalInputRef.current) additionalInputRef.current.value = ""
    }

    const physiqueTagsMap = useMemo(
        () => new Map(physiqueTags.map(tag => [tag.id, tag.name])),
        [physiqueTags]
    )

    const personalityTagsMap = useMemo(
        () => new Map(personalityTags.map(tag => [tag.id, tag.name])),
        [personalityTags]
    )

    const [existingProfilePictures, setExistingProfilePictures] = useState<
        { id: string; filename?: string; mime_type?: string }[]
    >([])

    const [existingAdditionalRecords, setExistingAdditionalRecords] = useState<
        { id: string; filename?: string; mime_type?: string }[]
    >([])

    const removeExistingProfileFile = (id: string) => {
        setExistingProfilePictures(prev => prev.filter(file => file.id !== id))
        const updatedIds = form.getValues().profile_picture_ids?.filter(existingId => existingId !== id)
        form.setValue("profile_picture_ids", updatedIds)
    }

    const removeExistingAdditionalFile = (id: string) => {
        setExistingAdditionalRecords(prev => prev.filter(file => file.id !== id))
        const updatedIds = form.getValues().additional_record_ids?.filter(existingId => existingId !== id)
        form.setValue("additional_record_ids", updatedIds)
    }

    const [downloadingId, setDownloadingId] = useState<string | null>(null)

    const handleOpenExistingFile = async (file: Attachment) => {
        try {
            setDownloadingId(file.id)
            await openAttachment(file)
        } finally {
            setDownloadingId(null)
        }
    }

    const handleOpenNewFile = (file: File) => {
        const fileUrl = URL.createObjectURL(file)
        window.open(fileUrl, "_blank")
        setTimeout(() => URL.revokeObjectURL(fileUrl), 1000)
    }

    const profileInputRef = useRef<HTMLInputElement | null>(null)
    const additionalInputRef = useRef<HTMLInputElement | null>(null)

    useEffect(() => {
        if (!isEditMode || !petId) return

        const fetchDetail = async () => {
            setIsLoadingDetail(true)
            try {
                const res = await petService.getPetById(petId || "")

                const safeSize: PetSize =
                    sizeOptions.includes(res.size as PetSize) ? (res.size as PetSize) : "small"
                const safeGender: PetGender =
                    genderOptions.includes(res.gender as PetGender) ? (res.gender as PetGender) : "male"

                form.reset({
                    name: res.name ?? "",
                    breed: res.breed ?? "",
                    size: safeSize,
                    date_of_birth: res.date_of_birth ? new Date(res.date_of_birth) : undefined,
                    gender: safeGender,
                    about: res.about ?? "",
                    special_needs: res.special_needs ?? false,
                    type_of_animal_id: res.type_of_animal_id ?? "",
                    physique_ids: res.physique_tags?.map(p => String(p.id)) ?? [],
                    personality_ids: res.personality_tags?.map(p => String(p.id)) ?? [],
                    profile_picture_ids: res.profile_pictures?.map(p => String(p.id)) ?? [],
                    additional_record_ids: res.additional_records?.map(p => String(p.id)) ?? [],
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
                    setInitialProvince({ id: String(res.address.province.id), name: res.address.province.name })
                }
                if (res.address?.regency) {
                    setInitialRegency({ id: String(res.address.regency.id), name: res.address.regency.name })
                }
                if (res.address?.district) {
                    setInitialDistrict({ id: String(res.address.district.id), name: res.address.district.name })
                }

                setExistingProfilePictures(
                    res.profile_pictures?.map(p => ({
                        id: String(p.id),
                        filename: p.filename ?? "Existing Image",
                        mime_type: p.mime_type,
                    })) ?? []
                )

                setExistingAdditionalRecords(
                    res.additional_records?.map(p => ({
                        id: String(p.id),
                        filename: p.filename ?? "Existing File",
                        mime_type: p.mime_type,
                    })) ?? []
                )
            } finally {
                setIsLoadingDetail(false)
            }
        }
        fetchDetail()
    }, [form, isEditMode, petId])

    if (isEditMode && isLoadingDetail) {
        return (
            <div className="p-10 text-center bg-green-50 min-h-screen py-12 px-4">
                <Icon icon="ph:circle-notch" className="w-8 h-8 animate-spin mx-auto mb-4"/>
                <p>Loading pet data...</p>
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
                        <FormLabel>Street *</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g. Jl. Pawsitive No. 123" {...field} />
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
                        <FormLabel>Province *</FormLabel>
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
                                mode="single"
                                className={cn(
                                    "w-full",
                                    fieldState.error && "border-destructive"
                                )}
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
                        <FormLabel>Regency / City *</FormLabel>
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
                                mode="single"
                                disabled={!selectedProvinceId}
                                className={cn(
                                    "w-full",
                                    fieldState.error && "border-destructive"
                                )}
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
                            <FormLabel>District *</FormLabel>
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
                                    mode="single"
                                    disabled={!selectedRegencyId}
                                    className={cn(
                                        "w-full",
                                        fieldState.error && "border-destructive"
                                    )}
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
                            <FormLabel>Zip Code <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. 62704" {...field} />
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
                        <FormLabel>Maps Link <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                        <FormControl>
                            <Input placeholder="e.g. https://maps.google.com/..." {...field} />
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
                        <FormLabel>Notes <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                        <FormControl>
                            <Textarea placeholder="Describe the address in more detail..." className="min-h-30" {...field} />
                        </FormControl>
                        <FormMessage/>
                    </FormItem>
                )}
            />
        </>
    )

    const renderAddressSection = () => {
        // Edit mode: pet has its own independent address (duplicated from user on create)
        // Just show the fields pre-filled, no toggle needed
        if (isEditMode) {
            return (
                <>
                    <h3 className="text-lg sm:text-xl font-semibold border-b pb-2">Address *</h3>
                    {renderAddressFields()}
                </>
            )
        }

        // Create mode: toggle between "same as mine" (BE duplicates user address) or custom
        return (
            <>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-2 gap-2 sm:gap-0">
                    <h3 className="text-lg sm:text-xl font-semibold">Address *</h3>
                    <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg w-full sm:w-auto">
                        <button
                            type="button"
                            onClick={() => handleToggleOwnerAddress(true)}
                            className={cn(
                                "flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all",
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
                                "flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all",
                                !useOwnerAddress ? "bg-white shadow-sm text-slate-800" : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            <MapPin className="h-3.5 w-3.5"/>
                            Custom
                        </button>
                    </div>
                </div>

                {useOwnerAddress ? (
                    <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 mt-4 sm:mt-0">
                        <Home className="h-4 w-4 shrink-0 text-slate-400"/>
                        <p>Pet location will use your registered address.</p>
                    </div>
                ) : (
                    renderAddressFields()
                )}
            </>
        )
    }

    return (
        <>
            <div className="min-h-screen bg-green-50 py-6 sm:py-12 px-2 sm:px-4 md:px-6">
                <div className="max-w-6xl mx-auto">
                    <Card className="rounded-2xl shadow-xl">
                        <CardContent className="p-4 sm:p-6 md:p-10">
                            <Form {...form}>
                                <form 
                                  onSubmit={form.handleSubmit(onSubmit, (errors) => {
                                      if (useOwnerAddress) {
                                          const nonAddressErrors = Object.keys(errors).filter(k => k !== "address")
                                          if (nonAddressErrors.length === 0) {
                                              onSubmit()
                                          }
                                      }
                                  })}
                                  className="[&_label]:text-xs sm:[&_label]:text-sm [&_input]:text-xs sm:[&_input]:text-sm [&_input]:h-9 sm:[&_input]:h-10 [&_textarea]:text-xs sm:[&_textarea]:text-sm [&_button[role='combobox']]:text-xs sm:[&_button[role='combobox']]:text-sm [&_button[role='combobox']]:h-9 sm:[&_button[role='combobox']]:h-10"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
                                        {/* LEFT COLUMN */}
                                        <div className="space-y-6">
                                            <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 border-b pb-2">
                                                {isEditMode ? "Edit Pet Information" : "Pet Information"}
                                            </h3>

                                            <FormField
                                                control={form.control}
                                                name="name"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel>Name *</FormLabel>
                                                        <FormControl><Input placeholder="e.g. Buddy" {...field} /></FormControl>
                                                        <FormMessage/>
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="breed"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel>Breed *</FormLabel>
                                                        <FormControl><Input placeholder="e.g. Golden Retriever" {...field} /></FormControl>
                                                        <FormMessage/>
                                                    </FormItem>
                                                )}
                                            />

                                            <div className="grid grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="type_of_animal_id"
                                                    render={({field, fieldState}) => (
                                                        <FormItem>
                                                            <FormLabel>Type *</FormLabel>
                                                            <FormControl>
                                                                <SearchableCombobox
                                                                    options={typeTags}
                                                                    selectedValues={[field.value]}
                                                                    onSelect={(value) => field.onChange(value)}
                                                                    onSearch={setTypeSearch}
                                                                    onLoadMore={loadMoreType}
                                                                    isLoading={isLoadingTypeTags}
                                                                    hasMore={hasMoreType}
                                                                    placeholder="Select type..."
                                                                    emptyMessage="No types found."
                                                                    mode={"single"}
                                                                    className={cn(
                                                                        "w-full",
                                                                        fieldState.error && "border-destructive"
                                                                    )}
                                                                />
                                                            </FormControl>
                                                            <FormMessage/>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="size"
                                                    render={({field, fieldState}) => (
                                                        <FormItem>
                                                            <FormLabel>Size *</FormLabel>
                                                            <FormControl>
                                                                <SearchableCombobox
                                                                    options={sizeComboboxOptions}
                                                                    selectedValues={field.value ? [field.value] : []}
                                                                    onSelect={(value) => field.onChange(value)}
                                                                    placeholder="Select size..."
                                                                    emptyMessage="No sizes found."
                                                                    mode={"single"}
                                                                    className={cn(
                                                                        "w-full",
                                                                        fieldState.error && "border-destructive"
                                                                    )}
                                                                />
                                                            </FormControl>
                                                            <FormMessage/>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="date_of_birth"
                                                    render={({field}) => (
                                                        <FormItem className="flex flex-col">
                                                            <FormLabel>Date of Birth *</FormLabel>
                                                            <Popover>
                                                                <PopoverTrigger asChild>
                                                                    <FormControl>
                                                                        <Button variant="outline" className={`pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}>
                                                                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                                            <Icon icon="ph:calendar-blank" className="ml-auto h-4 w-4 opacity-50"/>
                                                                        </Button>
                                                                    </FormControl>
                                                                </PopoverTrigger>
                                                                <PopoverContent className="w-auto p-0">
                                                                    <Calendar
                                                                        mode="single"
                                                                        selected={field.value}
                                                                        onSelect={field.onChange}
                                                                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                                                    />
                                                                </PopoverContent>
                                                            </Popover>
                                                            <FormMessage/>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="gender"
                                                    render={({field, fieldState}) => (
                                                        <FormItem>
                                                            <FormLabel>Gender *</FormLabel>
                                                            <FormControl>
                                                                <SearchableCombobox
                                                                    options={genderComboboxOptions}
                                                                    selectedValues={field.value ? [field.value] : []}
                                                                    onSelect={(value) => field.onChange(value)}
                                                                    placeholder="Select gender..."
                                                                    emptyMessage="No genders found."
                                                                    mode={"single"}
                                                                    className={cn(
                                                                        "w-full",
                                                                        "w-full",
                                                                        fieldState.error && "border-destructive"
                                                                    )}
                                                                />
                                                            </FormControl>
                                                            <FormMessage/>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <FormField
                                                control={form.control}
                                                name="about"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel>About *</FormLabel>
                                                        <FormControl>
                                                            <Textarea placeholder="Describe the pet's health, behaviour, and personality" className="min-h-30" {...field} />
                                                        </FormControl>
                                                        <FormMessage/>
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="physique_ids"
                                                render={({field, fieldState}) => (
                                                    <FormItem>
                                                        <FormLabel>Physique *</FormLabel>
                                                        <FormControl>
                                                            <SearchableCombobox
                                                                options={physiqueTags}
                                                                selectedValues={field.value}
                                                                onSelect={(tagId) => {
                                                                    if (!field.value.includes(tagId)) field.onChange([...field.value, tagId]);
                                                                }}
                                                                onSearch={setPhysiqueSearch}
                                                                onLoadMore={loadMorePhysique}
                                                                isLoading={isLoadingPhysiqueTags}
                                                                hasMore={hasMorePhysique}
                                                                placeholder="Select physique tags..."
                                                                emptyMessage="No physique tags found."
                                                                mode={"multiple"}
                                                                className={cn(
                                                                    "w-full",
                                                                    fieldState.error && "border-destructive"
                                                                )}
                                                            />
                                                        </FormControl>
                                                        <FormMessage/>
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            {field.value.map(tagId => (
                                                                <TagBadge key={tagId} label={physiqueTagsMap.get(tagId) || tagId} onRemove={() => field.onChange(field.value.filter(id => id !== tagId))}/>
                                                            ))}
                                                        </div>
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="personality_ids"
                                                render={({field, fieldState}) => (
                                                    <FormItem>
                                                        <FormLabel>Personality *</FormLabel>
                                                        <FormControl>
                                                            <SearchableCombobox
                                                                options={personalityTags}
                                                                selectedValues={field.value}
                                                                onSelect={(tagId) => {
                                                                    if (!field.value.includes(tagId)) field.onChange([...field.value, tagId]);
                                                                }}
                                                                onSearch={setPersonalitySearch}
                                                                onLoadMore={loadMorePersonality}
                                                                isLoading={isLoadingPersonalityTags}
                                                                hasMore={hasMorePersonality}
                                                                placeholder="Select personality tags..."
                                                                emptyMessage="No personality tags found."
                                                                mode={"multiple"}
                                                                className={cn(
                                                                    "w-full",
                                                                    fieldState.error && "border-destructive"
                                                                )}
                                                            />
                                                        </FormControl>
                                                        <FormMessage/>
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            {field.value.map(tagId => (
                                                                <TagBadge key={tagId} label={personalityTagsMap.get(tagId) || tagId} onRemove={() => field.onChange(field.value.filter(id => id !== tagId))}/>
                                                            ))}
                                                        </div>
                                                    </FormItem>
                                                )}
                                            />

                                            {renderAddressSection()}
                                        </div>

                                        {/* RIGHT COLUMN */}
                                        <div className="space-y-8">
                                            <div>
                                                <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 border-b pb-2">Profile Picture*</h3>
                                                <div className="border-2 border-dashed border-[#E0E0E0] rounded-lg p-4 sm:p-8 flex flex-col items-center justify-center text-center">
                                                    <Icon icon="ph:camera" className="w-10 h-10 sm:w-12 sm:h-12 text-[#BDBDBD] mb-3"/>
                                                    <p className="font-medium text-[#424242] text-sm">Upload Profile Picture</p>
                                                    <p className="text-xs text-[#757575] mb-4 mt-1">PNG, JPG, GIF (MAX. 800x800px)</p>
                                                    <label htmlFor="profile-upload">
                                                        <Button type="button" variant="outline" className="px-6 h-9 rounded-md border-[#E0E0E0] text-sm cursor-pointer" asChild>
                                                            <span>Select File</span>
                                                        </Button>
                                                    </label>
                                                    <input ref={profileInputRef} id="profile-upload" type="file" className="hidden" accept="image/jpeg,image/png,image/gif,image/webp" multiple onChange={handleProfileUpload}/>
                                                </div>
                                                {isSubmitted && profileFiles.length + existingProfilePictures.length === 0 && (
                                                    <p className="text-sm font-medium text-destructive mt-2">At least one profile picture is required</p>
                                                )}
                                                <p className="text-xs text-[#757575] mt-3">A great profile picture is key to finding a new home.</p>

                                                {existingProfilePictures.length > 0 && (
                                                    <div className="mt-3 space-y-2">
                                                        {existingProfilePictures.map((file) => (
                                                            <div key={file.id} className="flex items-center justify-between p-3 border border-[#E0E0E0] rounded-md text-sm">
                                                                <span onClick={() => handleOpenExistingFile(file as Attachment)} className="truncate flex-1 cursor-pointer hover:underline">
                                                                    {downloadingId === file.id ? "Opening..." : file.filename}
                                                                </span>
                                                                <Icon icon="ph:trash" className="w-4 h-4 text-[#F44336] cursor-pointer ml-2 shrink-0" onClick={() => removeExistingProfileFile(file.id)}/>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {profileFiles.length > 0 && (
                                                    <div className="mt-3 space-y-2">
                                                        {profileFiles.map((file, index) => (
                                                            <div key={`${file.name}-${file.lastModified}`} className="flex items-center justify-between p-3 border border-[#E0E0E0] rounded-md text-sm">
                                                                <span onClick={() => handleOpenNewFile(file)} className="truncate flex-1 cursor-pointer hover:underline">{file.name}</span>
                                                                <Icon icon="ph:trash" className="w-4 h-4 text-[#F44336] cursor-pointer ml-2 shrink-0" onClick={() => removeProfileFile(index)}/>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 border-b pb-2">Additional Records</h3>
                                                <div className="border-2 border-dashed border-[#E0E0E0] rounded-lg p-4 sm:p-8 flex flex-col items-center justify-center text-center">
                                                    <Icon icon="ph:cloud-arrow-up" className="w-10 h-10 sm:w-12 sm:h-12 text-[#BDBDBD] mb-3"/>
                                                    <p className="font-medium text-[#424242] text-sm">Click to upload or drag and drop</p>
                                                    <p className="text-xs text-[#757575] mb-4 mt-1">Photos, videos, or medical records</p>
                                                    <label htmlFor="additional-upload">
                                                        <Button type="button" variant="outline" className="px-6 h-9 rounded-md border-[#E0E0E0] text-sm cursor-pointer" asChild>
                                                            <span>Upload Files</span>
                                                        </Button>
                                                    </label>
                                                    <input ref={additionalInputRef} id="additional-upload" type="file" className="hidden" accept="image/jpeg,image/png,image/gif,image/webp,application/pdf,video/mp4,video/quicktime" multiple onChange={handleAdditionalUpload}/>
                                                </div>
                                                <p className="text-xs text-[#757575] mt-3">
                                                    Please upload multiple high-quality photos and any relevant documents.
                                                    <span className="font-medium"> Make sure the filename is relevant and descriptive.</span>
                                                </p>

                                                {existingAdditionalRecords.length > 0 && (
                                                    <div className="mt-3 space-y-2">
                                                        {existingAdditionalRecords.map((file) => (
                                                            <div key={file.id} className="flex items-center justify-between p-3 border border-[#E0E0E0] rounded-md text-sm">
                                                                <span onClick={() => handleOpenExistingFile(file as Attachment)} className="truncate flex-1 cursor-pointer hover:underline">
                                                                    {downloadingId === file.id ? "Opening..." : file.filename}
                                                                </span>
                                                                <Icon icon="ph:trash" className="w-4 h-4 text-[#F44336] cursor-pointer ml-2 shrink-0" onClick={() => removeExistingAdditionalFile(file.id)}/>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {additionalFiles.length > 0 && (
                                                    <div className="mt-3 space-y-2">
                                                        {additionalFiles.map((file, index) => (
                                                            <div key={index} className="flex items-center justify-between p-3 border border-[#E0E0E0] rounded-md text-sm">
                                                                <span onClick={() => handleOpenNewFile(file)} className="truncate flex-1 cursor-pointer hover:underline">{file.name}</span>
                                                                <Icon icon="ph:trash" className="w-4 h-4 text-[#F44336] cursor-pointer ml-2 shrink-0" onClick={() => removeAdditionalFile(index)}/>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 sm:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-t pt-6 gap-4 sm:gap-0">
                                        <FormField
                                            control={form.control}
                                            name="special_needs"
                                            render={({field}) => (
                                                <FormItem className="flex items-center space-x-3 pt-4 sm:pt-0">
                                                    <FormControl>
                                                        <Checkbox checked={field.value} onCheckedChange={field.onChange}/>
                                                    </FormControl>
                                                    <FormLabel className="text-sm font-medium">Does this animal have any special needs?</FormLabel>
                                                </FormItem>
                                            )}
                                        />
                                        <Button type="submit" className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white text-sm sm:text-base h-11 sm:h-auto">
                                            {isEditMode ? "Update Pet Profile" : "Submit new pet profile"}
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
                onContinue={() => router.push(currentPetId ? `/pets/${currentPetId}` : "/pets")}
                title={isEditMode ? "Update Pet Profile?" : "Create Pet Profile?"}
                description="Please review the pet's information before continuing."
                successTitle={isEditMode ? "Pet Profile Updated Successfully" : "Pet Profile Created Successfully"}
                successDescription="Your pet profile is now live."
                confirmText={isEditMode ? "Update Profile" : "Create Profile"}
                cancelText="Review Again"
            />
        </>
    )
}