"use client"

import {ChangeEvent, useEffect, useMemo, useState} from "react"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {Checkbox} from "@/components/ui/checkbox"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Calendar} from "@/components/ui/calendar";
import {Icon} from "@iconify/react";
import {TagBadge} from "@/components/badge/TagBadge";
import {openAttachment, uploadAttachment} from "@/lib/attachment-helpers";
import {CreatePetSchema} from "@/schemas/pet.schema";
import {CreatePetPayload, petService} from "@/services/petServices";
import {useTagsOptions} from "@/hooks/useFilterOptions";
import {SearchableCombobox} from "@/components/combobox/SearchableCombobox";
import {useRouter} from "next/navigation";
import {zodResolver} from "@hookform/resolvers/zod";
import {ActionDialog} from "@/components/dialog/ActionDialog";
import {genderOptions, PetGender, PetSize, sizeOptions} from "@/types/pet";
import {Attachment} from "@/types/attachment";

type PetFormProps = {
    mode: "create" | "edit"
    petId?: string
}

export default function PetForm({mode, petId}: PetFormProps) {
    const isEditMode = mode === "edit"

    const router = useRouter()
    const [profileFiles, setProfileFiles] = useState<File[]>([])
    const [additionalFiles, setAdditionalFiles] = useState<File[]>([])
    const [isLoadingDetail, setIsLoadingDetail] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const {
        options: physiqueTags,
        isLoading: isLoadingPhysiqueTags,
        setSearch: setPhysiqueSearch,
        loadMore: loadMorePhysique,
        hasMore: hasMorePhysique
    } = useTagsOptions("physique");

    const {
        options: personalityTags,
        isLoading: isLoadingPersonalityTags,
        setSearch: setPersonalitySearch,
        loadMore: loadMorePersonality,
        hasMore: hasMorePersonality
    } = useTagsOptions("personality");

    const {
        options: typeTags,
        isLoading: isLoadingTypeTags,
        setSearch: setTypeSearch,
        loadMore: loadMoreType,
        hasMore: hasMoreType
    } = useTagsOptions("type_of_animal");

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
        },
    })

    async function handleFinalSubmit() {
        const values = form.getValues()

        const uploadedProfileIds =
            profileFiles.length > 0
                ? await Promise.all(profileFiles.map(file => uploadAttachment(file, true)))
                : []

        const uploadedAdditionalIds =
            additionalFiles.length > 0
                ? await Promise.all(additionalFiles.map(file => uploadAttachment(file)))
                : []

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
        }

        if (isEditMode) {
            return await petService.updatePet(petId!, payload)
        }

        return await petService.createPet(payload)
    }

    function onSubmit() {
        setIsSubmitted(true)
        if (profileFiles.length === 0) return
        setDialogOpen(true)
    }

    const handleProfileUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files) return
        setProfileFiles([...profileFiles, ...Array.from(files)])
        setIsSubmitted(true)
    }

    const handleAdditionalUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files) return
        setAdditionalFiles([...additionalFiles, ...Array.from(files)])
    }

    const removeProfileFile = (index: number) => {
        setProfileFiles(profileFiles.filter((_, i) => i !== index))
    }

    const removeAdditionalFile = (index: number) => {
        setAdditionalFiles(additionalFiles.filter((_, i) => i !== index))
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
        setExistingProfilePictures(prev =>
            prev.filter(file => file.id !== id)
        )

        const updatedIds = form.getValues().profile_picture_ids?.filter(existingId => existingId !== id)

        form.setValue("profile_picture_ids", updatedIds)
    }

    const removeExistingAdditionalFile = (id: string) => {
        setExistingAdditionalRecords(prev =>
            prev.filter(file => file.id !== id)
        )

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

    useEffect(() => {
        if (!isEditMode || !petId) return

        const fetchDetail = async () => {
            try {
                setIsLoadingDetail(true)

                const res = await petService.getPetById(petId)

                const safeSize: PetSize =
                    sizeOptions.includes(res.size as PetSize)
                        ? (res.size as PetSize)
                        : "small"
                const safeGender: PetGender =
                    genderOptions.includes(res.gender as PetGender)
                        ? (res.gender as PetGender)
                        : "male"

                form.reset({
                    name: res.name ?? "",
                    breed: res.breed ?? "",
                    size: safeSize,
                    date_of_birth: res.date_of_birth
                        ? new Date(res.date_of_birth)
                        : undefined,
                    gender: safeGender,
                    about: res.about ?? "",
                    special_needs: res.special_needs ?? false,
                    type_of_animal_id: res.type_of_animal_id ?? "",
                    physique_ids: res.physique_tags?.map(p => String(p.id)) ?? [],
                    personality_ids: res.personality_tags?.map(p => String(p.id)) ?? [],
                    profile_picture_ids:
                        res.profile_pictures?.map(p => String(p.id)) ?? [],
                    additional_record_ids:
                        res.additional_records?.map(p => String(p.id)) ?? [],
                })

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
        return <div className="p-10 text-center bg-green-50 min-h-screen py-12 px-4">Loading pet data...</div>
    }

    return (
        <>
            <div className="min-h-screen bg-green-50 py-12 px-4">
                <div className="max-w-6xl mx-auto">
                    <Card className="rounded-2xl shadow-xl">
                        <CardContent className="p-10">
                            <Form {...form}>
                                <form
                                    onSubmit={form.handleSubmit(onSubmit)}
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        {/* LEFT COLUMN */}
                                        <div className="space-y-6">
                                            <h3 className="text-xl font-semibold mb-6 border-b pb-2">
                                                {isEditMode ? "Edit Pet Information" : "Pet Information"}
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
                                                name="breed"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel>Breed *</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="e.g. Golden Retriever" {...field} />
                                                        </FormControl>
                                                        <FormMessage/>
                                                    </FormItem>
                                                )}
                                            />

                                            <div className="grid grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="type_of_animal_id"
                                                    render={({field}) => (
                                                        <FormItem>
                                                            <FormLabel>Type *</FormLabel>
                                                            <FormControl>
                                                                <SearchableCombobox
                                                                    options={typeTags}
                                                                    selectedValues={[field.value]}
                                                                    onSelect={(value) => {
                                                                        field.onChange(value)
                                                                    }}
                                                                    onSearch={setTypeSearch}
                                                                    onLoadMore={loadMoreType}
                                                                    isLoading={isLoadingTypeTags}
                                                                    hasMore={hasMoreType}
                                                                    placeholder="Select type..."
                                                                    emptyMessage="No types found."
                                                                    mode={"single"}
                                                                />
                                                            </FormControl>
                                                            <FormMessage/>
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="size"
                                                    render={({field}) => (
                                                        <FormItem>
                                                            <FormLabel>Size *</FormLabel>
                                                            <Select
                                                                onValueChange={field.onChange}
                                                                defaultValue={field.value}
                                                            >
                                                                <FormControl className="w-full">
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Select"/>
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="small">Small</SelectItem>
                                                                    <SelectItem value="medium">Medium</SelectItem>
                                                                    <SelectItem value="large">Large</SelectItem>
                                                                    <SelectItem value="extra large">Extra
                                                                        Large</SelectItem>
                                                                </SelectContent>
                                                            </Select>
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
                                                                        <Button
                                                                            variant="outline"
                                                                            className={`pl-3 text-left font-normal ${
                                                                                !field.value && "text-muted-foreground"
                                                                            }`}
                                                                        >
                                                                            {field.value ? (
                                                                                format(field.value, "PPP")
                                                                            ) : (
                                                                                <span>Pick a date</span>
                                                                            )}
                                                                            <Icon icon="ph:calendar-blank"
                                                                                  className="ml-auto h-4 w-4 opacity-50"/>
                                                                        </Button>
                                                                    </FormControl>
                                                                </PopoverTrigger>
                                                                <PopoverContent className="w-auto p-0">
                                                                    <Calendar
                                                                        mode="single"
                                                                        selected={field.value}
                                                                        onSelect={field.onChange}
                                                                        disabled={(date) =>
                                                                            date > new Date() || date < new Date("1900-01-01")
                                                                        }
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
                                                    render={({field}) => (
                                                        <FormItem>
                                                            <FormLabel>Gender *</FormLabel>
                                                            <Select
                                                                onValueChange={field.onChange}
                                                                defaultValue={field.value}
                                                            >
                                                                <FormControl className="w-full">
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Select"/>
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="male">Male</SelectItem>
                                                                    <SelectItem value="female">Female</SelectItem>
                                                                </SelectContent>
                                                            </Select>
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
                                                            <Textarea
                                                                placeholder="Describe the pet's health, behaviour, and personality"
                                                                className="min-h-30"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage/>
                                                    </FormItem>
                                                )}
                                            />

                                            <div className="flex flex-col gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="physique_ids"
                                                    render={({field}) => (
                                                        <FormItem>
                                                            <FormLabel>Physique *</FormLabel>
                                                            <FormControl>
                                                                <SearchableCombobox
                                                                    options={physiqueTags}
                                                                    selectedValues={field.value}
                                                                    onSelect={(tagId) => {
                                                                        if (!field.value.includes(tagId)) {
                                                                            field.onChange([...field.value, tagId]);
                                                                        }
                                                                    }}
                                                                    onSearch={setPhysiqueSearch}
                                                                    onLoadMore={loadMorePhysique}
                                                                    isLoading={isLoadingPhysiqueTags}
                                                                    hasMore={hasMorePhysique}
                                                                    placeholder="Select physique tags..."
                                                                    emptyMessage="No physique tags found."
                                                                    mode={"multiple"}
                                                                />
                                                            </FormControl>
                                                            <FormMessage/>
                                                            <div className="flex flex-wrap gap-2 mt-2">
                                                                {field.value.map(tagId => (
                                                                    <TagBadge
                                                                        key={tagId}
                                                                        label={physiqueTagsMap.get(tagId) || tagId}
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
                                            </div>

                                            <div className="flex flex-col gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="personality_ids"
                                                    render={({field}) => (
                                                        <FormItem>
                                                            <FormLabel>Personality *</FormLabel>
                                                            <FormControl>
                                                                <SearchableCombobox
                                                                    options={personalityTags}
                                                                    selectedValues={field.value}
                                                                    onSelect={(tagId) => {
                                                                        if (!field.value.includes(tagId)) {
                                                                            field.onChange([...field.value, tagId]);
                                                                        }
                                                                    }}
                                                                    onSearch={setPersonalitySearch}
                                                                    onLoadMore={loadMorePersonality}
                                                                    isLoading={isLoadingPersonalityTags}
                                                                    hasMore={hasMorePersonality}
                                                                    placeholder="Select personality tags..."
                                                                    emptyMessage="No personality tags found."
                                                                    mode={"multiple"}
                                                                />
                                                            </FormControl>
                                                            <FormMessage/>
                                                            <div className="flex flex-wrap gap-2 mt-2">
                                                                {field.value.map(tagId => (
                                                                    <TagBadge
                                                                        key={tagId}
                                                                        label={personalityTagsMap.get(tagId) || tagId}
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
                                            </div>
                                        </div>

                                        {/* RIGHT COLUMN */}
                                        <div className="space-y-8">
                                            <div>
                                                <h3 className="text-xl font-semibold mb-6 border-b pb-2">Profile
                                                    Picture*</h3>
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
                                                        id="profile-upload"
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        multiple
                                                        onChange={handleProfileUpload}
                                                    />
                                                </div>
                                                {isSubmitted && profileFiles.length === 0 && (
                                                    <p className="text-sm font-medium text-destructive mt-2">
                                                        At least one profile picture is required
                                                    </p>
                                                )}
                                                <p className="text-xs text-[#757575] mt-3">A great profile picture is
                                                    key to
                                                    finding a new home.</p>

                                                {/* EXISTING FILES */}
                                                {existingProfilePictures.length > 0 && (
                                                    <div className="mt-3 space-y-2">
                                                        {existingProfilePictures.map((file, index) => (
                                                            <div
                                                                key={file.id}
                                                                className="flex items-center justify-between p-3 border border-[#E0E0E0] rounded-md text-sm"
                                                            >
                                                                <span
                                                                    onClick={() => handleOpenExistingFile(file as Attachment)}
                                                                    className="truncate flex-1 cursor-pointer hover:underline"
                                                                >{downloadingId === file.id ? "Opening..." : file.filename}</span>

                                                                <Icon
                                                                    icon="ph:trash"
                                                                    className="w-4 h-4 text-[#F44336] cursor-pointer ml-2 shrink-0"
                                                                    onClick={() => removeExistingProfileFile(file.id)}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* NEW FILES */}
                                                {profileFiles.length > 0 && (
                                                    <div className="mt-3 space-y-2">
                                                        {profileFiles.map((file, index) => (
                                                            <div
                                                                key={index}
                                                                className="flex items-center justify-between p-3 border border-[#E0E0E0] rounded-md text-sm"
                                                            >
                                                                <span
                                                                    onClick={() => handleOpenNewFile(file)}
                                                                    className="truncate flex-1 cursor-pointer hover:underline"
                                                                >{file.name}</span>

                                                                <Icon
                                                                    icon="ph:trash"
                                                                    className="w-4 h-4 text-[#F44336] cursor-pointer ml-2 shrink-0"
                                                                    onClick={() => removeProfileFile(index)}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <h3 className="text-xl font-semibold mb-6 border-b pb-2">Additional
                                                    Records</h3>
                                                <div
                                                    className="border-2 border-dashed border-[#E0E0E0] rounded-lg p-8 flex flex-col items-center justify-center">
                                                    <Icon icon="ph:cloud-arrow-up"
                                                          className="w-12 h-12 text-[#BDBDBD] mb-3"/>
                                                    <p className="font-medium text-[#424242] text-sm">Click to upload or
                                                        drag
                                                        and drop</p>
                                                    <p className="text-xs text-[#757575] mb-4 mt-1">Photos, videos, or
                                                        medical
                                                        records</p>
                                                    <label htmlFor="additional-upload">
                                                        <Button type="button" variant="outline"
                                                                className="px-6 h-9 rounded-md border-[#E0E0E0] text-sm cursor-pointer"
                                                                asChild>
                                                            <span>Upload Files</span>
                                                        </Button>
                                                    </label>
                                                    <input
                                                        id="additional-upload"
                                                        type="file"
                                                        className="hidden"
                                                        multiple
                                                        onChange={handleAdditionalUpload}
                                                    />
                                                </div>
                                                <p className="text-xs text-[#757575] mt-3">
                                                    Please upload multiple high-quality photos and any relevant
                                                    documents.
                                                    <span className="font-medium"> Make sure the filename is relevant and descriptive.</span>
                                                </p>

                                                {/* EXISTING FILES */}
                                                {existingAdditionalRecords.length > 0 && (
                                                    <div className="mt-3 space-y-2">
                                                        {existingAdditionalRecords.map((file, index) => (
                                                            <div
                                                                key={file.id}
                                                                className="flex items-center justify-between p-3 border border-[#E0E0E0] rounded-md text-sm"
                                                            >
                                                                <span
                                                                    onClick={() => handleOpenExistingFile(file as Attachment)}
                                                                    className="truncate flex-1 cursor-pointer hover:underline"
                                                                >{downloadingId === file.id ? "Opening..." : file.filename}</span>

                                                                <Icon
                                                                    icon="ph:trash"
                                                                    className="w-4 h-4 text-[#F44336] cursor-pointer ml-2 shrink-0"
                                                                    onClick={() => removeExistingAdditionalFile(file.id)}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* NEW FILES */}
                                                {additionalFiles.length > 0 && (
                                                    <div className="mt-3 space-y-2">
                                                        {additionalFiles.map((file, index) => (
                                                            <div
                                                                key={index}
                                                                className="flex items-center justify-between p-3 border border-[#E0E0E0] rounded-md text-sm">
                                                            <span
                                                                onClick={() => handleOpenNewFile(file)}
                                                                className="truncate flex-1 cursor-pointer hover:underline"
                                                            >{file.name}</span>
                                                                <Icon
                                                                    icon="ph:trash"
                                                                    className="w-4 h-4 text-[#F44336] cursor-pointer ml-2 shrink-0"
                                                                    onClick={() => removeAdditionalFile(index)}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-10 space-y-4 flex flex-wrap justify-between border-t pt-6">
                                        <FormField
                                            control={form.control}
                                            name="special_needs"
                                            render={({field}) => (
                                                <FormItem className="flex items-center space-x-3 pt-4">
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                    <FormLabel>
                                                        Does this animal have any special needs?
                                                    </FormLabel>
                                                </FormItem>
                                            )}
                                        />
                                        <Button type="submit"
                                                className="mt-4 bg-green-600 hover:bg-green-700 text-white">
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
                onContinue={() => router.push("/find-pet")}
                title={isEditMode ? "Update Pet Profile?" : "Create Pet Profile?"}
                description="Please review the pet's information before continuing."
                successTitle={isEditMode
                    ? "Pet Profile Updated Successfully"
                    : "Pet Profile Created Successfully"}
                successDescription="Your pet profile is now live."
                confirmText={isEditMode ? "Update Profile" : "Create Profile"}
                cancelText="Review Again"
            />

        </>
    )
}