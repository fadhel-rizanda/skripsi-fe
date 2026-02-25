"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession, signOut } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Icon } from "@iconify/react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form"
import { PetCard } from "@/components/card/PetCard"
import { PaginationBar } from "@/components/pagination/PaginationBar"

import { userService } from "@/services/userServices"
import { petService } from "@/services/petServices"
import { ProviderProfileSchema, ProviderProfileInput } from "@/schemas/edit-profile.schema"
import { UserDetail } from "@/types/user"
import { Pet } from "@/types/pet"

export default function ProviderProfileDashboard() {
    const { data: session } = useSession()
    const [profile, setProfile] = useState<UserDetail | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)

    // Pet listing state
    const [pets, setPets] = useState<Pet[]>([])
    const [petPage, setPetPage] = useState(1)
    const [petPerPage, setPetPerPage] = useState(10)
    const [petTotal, setPetTotal] = useState(0)
    const [isPetsLoading, setIsPetsLoading] = useState(true)

    const form = useForm<ProviderProfileInput>({
        resolver: zodResolver(ProviderProfileSchema),
        defaultValues: {
            name: "", phone: "", about_me: "",
            street: "", city: "", state: "", zip_code: "", country: "",
        },
    })

    // Fetch profile & populate form
    useEffect(() => {
        const fetchProfile = async () => {
            if (!session?.user?.id) return
            try {
                const data = await userService.getUserById(session.user.id)
                setProfile(data)

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
                })
            } catch {
                // silently fail
            } finally {
                setIsLoading(false)
            }
        }
        fetchProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session?.user?.id])

    // Fetch provider's pets
    const fetchPets = useCallback(async () => {
        setIsPetsLoading(true)
        try {
            const res = await petService.getPets({ page: petPage, per_page: petPerPage })
            setPets(res.data ?? [])
            setPetTotal(res.total ?? 0)
        } catch {
            // silently fail
        } finally {
            setIsPetsLoading(false)
        }
    }, [petPage, petPerPage])

    useEffect(() => {
        fetchPets()
    }, [fetchPets])

    async function onSubmit(values: ProviderProfileInput) {
        try {
            const updated = await userService.updateProfile(values)
            setProfile(updated)
            setIsEditing(false)
            toast.success("Profile updated successfully!")
        } catch {
            toast.error("Failed to update profile. Please try again.")
        }
    }

    function handleCancel() {
        if (!profile) return
        const addr = profile.address
        form.reset({
            name: profile.name ?? "",
            phone: profile.phone ?? "",
            about_me: profile.about_me ?? "",
            street: addr?.street ?? profile.street ?? "",
            city: addr?.city ?? "",
            state: addr?.state ?? "",
            zip_code: addr?.zip_code ?? "",
            country: addr?.country ?? "",
        })
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
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 mt-1">
                            Provider
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
                        <SectionCard title="Address" description="Your shelter / organization address.">
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
                        <SectionCard title="About" description="Tell us about your organization.">
                            <FormField
                                control={form.control}
                                name="about_me"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>About our shelter</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="We are a no-kill shelter focused on..."
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

                        {/* Action Buttons */}
                        {isEditing && (
                            <div className="flex items-center justify-end gap-3 pt-2">
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

                {/* Our Animals Section */}
                <Card className="rounded-2xl shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-6">Our animals</h2>

                    {isPetsLoading ? (
                        <div className="py-10 text-center">
                            <Icon icon="ph:circle-notch" className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                        </div>
                    ) : pets.length === 0 ? (
                        <p className="py-10 text-center text-muted-foreground">
                            No animals listed yet.
                        </p>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {pets.map((pet) => (
                                    <PetCard
                                        key={pet.id}
                                        id={pet.id}
                                        name={pet.name}
                                        type={pet.type_of_animal_name ?? ""}
                                        age={`${pet.age} ${pet.age_unit ?? ""}`.trim()}
                                        imageUrl={pet.profile_picture ?? ""}
                                    />
                                ))}
                            </div>

                            {petTotal > petPerPage && (
                                <div className="mt-6">
                                    <PaginationBar
                                        current_page={petPage}
                                        total={petTotal}
                                        per_page={petPerPage}
                                        onPageChange={setPetPage}
                                        onDataPerPageChange={(n) => {
                                            setPetPerPage(n)
                                            setPetPage(1)
                                        }}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </Card>

                {/* bottom spacer */}
                <div className="pb-8" />
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