"use client"

import { useEffect, useMemo, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Icon } from "@iconify/react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form"
import { SearchableCombobox } from "@/components/combobox/SearchableCombobox"
import { TagBadge } from "@/components/badge/TagBadge"

import { userService } from "@/services/userServices"
import { useTagsOptions } from "@/hooks/useFilterOptions"
import { TAG_TYPE } from "@/constant/tag-type"
import { AdopterProfileSchema, AdopterProfileInput } from "@/schemas/edit-profile.schema"
import { UserDetail } from "@/types/user"

export default function AdopterProfileDashboard() {
    const { data: session } = useSession()
    const [profile, setProfile] = useState<UserDetail | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)

    // Tag options
    const {
        options: personalityTagOptions, isLoading: isLoadingPersonality,
        setSearch: setPersonalitySearch, loadMore: loadMorePersonality, hasMore: hasMorePersonality,
    } = useTagsOptions(TAG_TYPE.USER.PERSONALITY)

    const {
        options: experienceTagOptions, isLoading: isLoadingExperience,
        setSearch: setExperienceSearch, loadMore: loadMoreExperience, hasMore: hasMoreExperience,
    } = useTagsOptions(TAG_TYPE.USER.EXPERIENCE)

    const {
        options: preferencesTagOptions, isLoading: isLoadingPreferences,
        setSearch: setPreferencesSearch, loadMore: loadMorePreferences, hasMore: hasMorePreferences,
    } = useTagsOptions(TAG_TYPE.USER.PREFERENCES)

    const personalityTagsMap = useMemo(
        () => new Map(personalityTagOptions.map(t => [t.id, t.name])),
        [personalityTagOptions]
    )
    const experienceTagsMap = useMemo(
        () => new Map(experienceTagOptions.map(t => [t.id, t.name])),
        [experienceTagOptions]
    )
    const preferencesTagsMap = useMemo(
        () => new Map(preferencesTagOptions.map(t => [t.id, t.name])),
        [preferencesTagOptions]
    )

    const form = useForm<AdopterProfileInput>({
        resolver: zodResolver(AdopterProfileSchema),
        defaultValues: {
            name: "", phone: "", about_me: "",
            street: "", city: "", state: "", zip_code: "", country: "",
            personality: "", pet_experience: "", pet_preferences: "",
            personality_tags: [], pet_experience_tags: [], pet_preferences_tags: [],
            open_to_special_needs: false,
        },
    })

    // Fetch profile & populate form
    function resetFormFromProfile(data: typeof profile) {
        if (!data) return
        const addr = data.address
        form.reset({
            name: data.name ?? "",
            phone: data.phone ?? "",
            about_me: data.about_me ?? "",
            street: addr?.street ?? data.street ?? "",
            city: addr?.city ?? "",
            state: addr?.state ?? "",
            zip_code: addr?.zip_code ?? "",
            country: addr?.country ?? "",
            personality: data.personality ?? "",
            pet_experience: data.pet_experience ?? "",
            pet_preferences: data.pet_preferences ?? "",
            personality_tags: data.personality_tags?.map((t: { id: string }) => t.id) ?? [],
            pet_experience_tags: data.pet_experience_tags?.map((t: { id: string }) => t.id) ?? [],
            pet_preferences_tags: data.pet_preferences_tags?.map((t: { id: string }) => t.id) ?? [],
            open_to_special_needs: data.open_to_special_needs ?? false,
        })
    }

    useEffect(() => {
        const fetchProfile = async () => {
            if (!session?.user?.id) return
            try {
                const data = await userService.getUserById(session.user.id)
                setProfile(data)
                resetFormFromProfile(data)
            } catch {
                // silently fail
            } finally {
                setIsLoading(false)
            }
        }
        fetchProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session?.user?.id])

    async function onSubmit(values: AdopterProfileInput) {
        if (!session?.user?.id) {
            toast.error("User session not found. Please log in again.")
            return
        }
        try {
            await userService.putUsers(values)
            const refreshed = await userService.getUserById(session.user.id)
            setProfile(refreshed)
            resetFormFromProfile(refreshed)
            setIsEditing(false)
            toast.success("Profile updated successfully!")
        } catch {
            toast.error("Failed to update profile. Please try again.")
        }
    }

    function handleCancel() {
        resetFormFromProfile(profile)
        setIsEditing(false)
    }

    if (isLoading) return (
        <div className="p-10 text-center">
            <Icon icon="ph:circle-notch" className="w-8 h-8 animate-spin mx-auto" />
        </div>
    )

    if (!profile) return (
        <div className="p-10 text-center text-muted-foreground">Failed to load profile.</div>
    )

    const joinedYear = new Date(profile.created_at).getFullYear()

    return (
        <div className="min-h-screen bg-green-50/50 py-10 px-4">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Profile Header */}
                <div className="flex items-center gap-6 bg-white rounded-2xl shadow-md p-6">
                    <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                        {profile.avatar ? (
                            <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                        ) : (
                            <Icon icon="ph:user-circle" className="w-12 h-12 text-gray-400" />
                        )}
                    </div>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold">{profile.name}</h1>
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 mt-1">
                            Adopter
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">Joined in {joinedYear}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        {!isEditing && (
                            <Button variant="outline" onClick={() => setIsEditing(true)}>
                                <Icon icon="ph:pencil" className="mr-2 w-4 h-4" />
                                Edit Profile
                            </Button>
                        )}
                        <Button variant="destructive" onClick={() => signOut()}>
                            Logout
                        </Button>
                    </div>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                        {/* Personal Information */}
                        <SectionCard title="Personal Information" description="Update your photo and personal details here.">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="hidden">
                                        <FormControl><Input {...field} /></FormControl>
                                    </FormItem>
                                )}
                            />
                            <div className="space-y-4">
                                <div>
                                    <FormLabel className="text-sm font-medium">Email address</FormLabel>
                                    <Input value={profile.email} disabled className="mt-1.5 bg-gray-50" />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone Number</FormLabel>
                                            <FormControl>
                                                <Input placeholder="555-123-4567" disabled={!isEditing} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </SectionCard>

                        {/* Address */}
                        <SectionCard title="Address" description="Your home address.">
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="street"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Street address</FormLabel>
                                            <FormControl>
                                                <Input placeholder="123 Main St" disabled={!isEditing} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-3 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="city"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>City</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Anytown" disabled={!isEditing} {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="state"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>State / Province</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="CA" disabled={!isEditing} {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="zip_code"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>ZIP / Postal code</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="12345" disabled={!isEditing} {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </SectionCard>

                        {/* About */}
                        <SectionCard title="About" description="Tell us more about you.">
                            <FormField
                                control={form.control}
                                name="about_me"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>About me</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="I'm an experienced dog owner looking for a new furry friend..."
                                                className="resize-none"
                                                rows={5}
                                                disabled={!isEditing}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </SectionCard>

                        {/* Personality */}
                        <SectionCard title="Personality" description="Tell us more about yourself. This is optional.">
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="personality"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>My Personality</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="I consider myself a caring and responsible person..."
                                                    className="resize-none"
                                                    rows={4}
                                                    disabled={!isEditing}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="personality_tags"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Personality Tags</FormLabel>
                                            <div className="flex flex-wrap items-center gap-2">
                                                {field.value?.map(tagId => (
                                                    <TagBadge
                                                        key={tagId}
                                                        label={personalityTagsMap.get(tagId) || tagId}
                                                        onRemove={isEditing ? () => field.onChange(field.value?.filter(id => id !== tagId)) : undefined}
                                                    />
                                                ))}
                                                {isEditing && (
                                                    <SearchableCombobox
                                                        options={personalityTagOptions}
                                                        selectedValues={field.value ?? []}
                                                        onSelect={(tagId) => {
                                                            if (!field.value?.includes(tagId)) {
                                                                field.onChange([...(field.value ?? []), tagId])
                                                            }
                                                        }}
                                                        onSearch={setPersonalitySearch}
                                                        onLoadMore={loadMorePersonality}
                                                        isLoading={isLoadingPersonality}
                                                        hasMore={hasMorePersonality}
                                                        placeholder="Search tags..."
                                                        emptyMessage="No tags found."
                                                        mode="multiple"
                                                    />
                                                )}
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </SectionCard>

                        {/* Pet Experience */}
                        <SectionCard title="Pet Experience" description="Tell us more about your experience.">
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="pet_experience"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>My Pet Experience</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Describe your experience with pets..."
                                                    className="resize-none"
                                                    rows={4}
                                                    disabled={!isEditing}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="pet_experience_tags"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Experience Tags</FormLabel>
                                            <div className="flex flex-wrap items-center gap-2">
                                                {field.value?.map(tagId => (
                                                    <TagBadge
                                                        key={tagId}
                                                        label={experienceTagsMap.get(tagId) || tagId}
                                                        onRemove={isEditing ? () => field.onChange(field.value?.filter(id => id !== tagId)) : undefined}
                                                    />
                                                ))}
                                                {isEditing && (
                                                    <SearchableCombobox
                                                        options={experienceTagOptions}
                                                        selectedValues={field.value ?? []}
                                                        onSelect={(tagId) => {
                                                            if (!field.value?.includes(tagId)) {
                                                                field.onChange([...(field.value ?? []), tagId])
                                                            }
                                                        }}
                                                        onSearch={setExperienceSearch}
                                                        onLoadMore={loadMoreExperience}
                                                        isLoading={isLoadingExperience}
                                                        hasMore={hasMoreExperience}
                                                        placeholder="Search tags..."
                                                        emptyMessage="No tags found."
                                                        mode="multiple"
                                                    />
                                                )}
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="open_to_special_needs"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center space-x-3 space-y-0 pt-2">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                    disabled={!isEditing}
                                                />
                                            </FormControl>
                                            <FormLabel className="text-sm font-medium cursor-pointer">
                                                I&apos;m open to pets with special needs
                                            </FormLabel>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </SectionCard>

                        {/* Action Buttons */}
                        {isEditing && (
                            <div className="flex items-center justify-end gap-3 pt-2 pb-8">
                                <Button type="button" variant="outline" onClick={handleCancel}>
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8"
                                    disabled={form.formState.isSubmitting}
                                >
                                    {form.formState.isSubmitting ? (
                                        <>
                                            <Icon icon="ph:circle-notch" className="mr-2 w-4 h-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : "Save Changes"}
                                </Button>
                            </div>
                        )}
                    </form>
                </Form>
            </div>
        </div>
    )
}

/* ---------- Shared section card ---------- */
function SectionCard({
    title,
    description,
    children,
}: {
    title: string
    description?: string
    children: React.ReactNode
}) {
    return (
        <Card className="rounded-2xl shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 p-6">
                <div>
                    <h2 className="text-lg font-semibold">{title}</h2>
                    {description && (
                        <p className="text-sm text-muted-foreground mt-1">{description}</p>
                    )}
                </div>
                <div>{children}</div>
            </div>
        </Card>
    )
}