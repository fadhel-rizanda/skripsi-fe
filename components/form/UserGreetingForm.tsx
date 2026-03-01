"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { userService } from "@/services/userServices";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { SearchableCombobox } from "@/components/combobox/SearchableCombobox";
import { TagBadge } from "@/components/badge/TagBadge";

import { useTagsOptions } from "@/hooks/useFilterOptions";
import { TAG_TYPE } from "@/constant/tag-type";
import { PET_EXPERIENCE_OPTIONS } from "@/constant/pet-experience";
import { GreetingSchema, GreetingFormInput } from "@/schemas/greeting.schema";

export default function UserGreetingForm() {
    const router = useRouter();
    const { data: session } = useSession();

    const {
        options: personalityTags,
        isLoading: isLoadingPersonalityTags,
        setSearch: setPersonalitySearch,
        loadMore: loadMorePersonality,
        hasMore: hasMorePersonality,
    } = useTagsOptions(TAG_TYPE.USER.PERSONALITY);

    const personalityTagsMap = useMemo(
        () => new Map(personalityTags.map((tag) => [tag.id, tag.name])),
        [personalityTags]
    );

    const form = useForm<GreetingFormInput>({
        resolver: zodResolver(GreetingSchema),
        defaultValues: {
            personality_ids: [],
            personality_description: "",
            pet_experience: undefined,
            pet_experience_description: "",
            address: {
                street: "",
                city: "",
                state: "",
                zip_code: "",
                country: "",
            },
            open_to_special_needs: false,
        },
    });

    async function onSubmit(values: GreetingFormInput) {
        try {
            await userService.putUsers(session?.user?.id ?? "", values);
            toast.success("Preferences saved! Let's find your perfect pet.");
            router.push("/dashboard");
        } catch {
            toast.error("Failed to save preferences. Please try again.");
        }
    }

    return (
        <div className="min-h-screen bg-green-50 py-12 px-4">
            <div className="max-w-3xl mx-auto">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        {/* Personality Card */}
                        <Card className="rounded-2xl shadow-md text-left">
                            <CardHeader>
                                <CardTitle className="text-xl font-semibold">
                                    Personality
                                </CardTitle>
                                <CardDescription>
                                    Help us understand your personality to find a suitable pet.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="personality_ids"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Personality Traits *</FormLabel>
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
                                                    placeholder="Search personality traits..."
                                                    emptyMessage="No personality traits found."
                                                    mode="multiple"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {field.value.map((tagId) => (
                                                    <TagBadge
                                                        key={tagId}
                                                        label={personalityTagsMap.get(tagId) || tagId}
                                                        onRemove={() => {
                                                            field.onChange(
                                                                field.value.filter((id) => id !== tagId)
                                                            );
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="personality_description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Additional Description</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Tell us more about your personality..."
                                                    className="resize-none"
                                                    rows={3}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        {/* Pet Experience Card */}
                        <Card className="rounded-2xl shadow-md text-left">
                            <CardHeader>
                                <CardTitle className="text-xl font-semibold">
                                    Pet Experience
                                </CardTitle>
                                <CardDescription>
                                    Let us know how experienced you are with pets.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="pet_experience"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Experience Level *</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select your experience level..." />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {PET_EXPERIENCE_OPTIONS.map((option) => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="pet_experience_description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Additional Description</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Describe your experience with pets..."
                                                    className="resize-none"
                                                    rows={3}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        {/* Address Card */}
                        <Card className="rounded-2xl shadow-md text-left">
                            <CardHeader>
                                <CardTitle className="text-xl font-semibold">
                                    Address
                                </CardTitle>
                                <CardDescription>
                                    Let us know where you live, so we can personalize the search for you.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="address.street"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Street</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter your street address..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="address.city"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>City</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="City" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="address.state"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>State / Province</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="State" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="address.zip_code"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Zip Code</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Zip code" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="address.country"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Country</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Country" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Special Needs Checkbox */}
                        <FormField
                            control={form.control}
                            name="open_to_special_needs"
                            render={({ field }) => (
                                <FormItem className="flex items-start space-x-3 space-y-0 rounded-2xl border bg-white p-5 shadow-md">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel className="text-base font-semibold cursor-pointer">
                                            I'm open to pets with special needs
                                        </FormLabel>
                                        <p className="text-sm text-muted-foreground">
                                            Pets with special needs may require extra care and attention.
                                        </p>
                                    </div>
                                </FormItem>
                            )}
                        />

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => router.push("/dashboard")}
                            >
                                Skip for now
                            </Button>
                            <Button
                                type="submit"
                                className="bg-green-500 hover:bg-green-600 font-bold"
                                disabled={form.formState.isSubmitting}
                            >
                                {form.formState.isSubmitting ? "Saving..." : "Save & Continue"}
                            </Button>
                        </div>

                    </form>
                </Form>
            </div>
        </div>
    );
}
