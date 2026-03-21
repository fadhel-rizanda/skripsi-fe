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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { SearchableCombobox } from "@/components/combobox/SearchableCombobox";
import { TagBadge } from "@/components/badge/TagBadge";

import {
  useTagsOptions,
  useProvincesOptions,
  useRegenciesOptions,
  useDistrictsOptions,
} from "@/hooks/useFilterOptions";
import { TAG_TYPE } from "@/constant/tag-type";
import {
  AdopterGreetingSchema,
  ProviderGreetingSchema,
  GreetingFormInput,
} from "@/schemas/greeting.schema";

type UserGreetingFormProps = {
  role: "adopter" | "provider";
};

export default function UserGreetingForm({ role }: UserGreetingFormProps) {
  const isAdopter = role === "adopter";
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
    [personalityTags],
  );

  const {
    options: petExperienceTags,
    isLoading: isLoadingPetExperienceTags,
    setSearch: setPetExperienceSearch,
    loadMore: loadMorePetExperience,
    hasMore: hasMorePetExperience,
  } = useTagsOptions(TAG_TYPE.USER.EXPERIENCE);

  const petExperienceTagsMap = useMemo(
    () => new Map(petExperienceTags.map((tag) => [tag.id, tag.name])),
    [petExperienceTags],
  );

  const form = useForm<GreetingFormInput>({
    resolver: zodResolver(isAdopter ? AdopterGreetingSchema : ProviderGreetingSchema),
    defaultValues: {
      ...(isAdopter
        ? {
            personality_tags: [],
            personality: "",
            pet_experience: "",
            pet_experience_tags: [],
            open_to_special_needs: false,
          }
        : {}),
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
  });

  const selectedProvinceId = form.watch("address.province_id");
  const selectedRegencyId = form.watch("address.regency_id");

  const {
    options: provinces,
    isLoading: isLoadingProvinces,
    setSearch: setProvincesSearch,
    loadMore: loadMoreProvinces,
    hasMore: hasMoreProvinces,
  } = useProvincesOptions();

  const {
    options: regencies,
    isLoading: isLoadingRegencies,
    setSearch: setRegenciesSearch,
    loadMore: loadMoreRegencies,
    hasMore: hasMoreRegencies,
  } = useRegenciesOptions(selectedProvinceId ?? "");

  const {
    options: districts,
    isLoading: isLoadingDistricts,
    setSearch: setDistrictsSearch,
    loadMore: loadMoreDistricts,
    hasMore: hasMoreDistricts,
  } = useDistrictsOptions(selectedRegencyId ?? "");

  async function onSubmit(values: GreetingFormInput) {
    if (!session?.user?.id) {
      toast.error("User session not found. Please log in again.");
      return;
    }
    try {
      await userService.putUsers(values);
      toast.success(
        isAdopter
          ? "Preferences saved! Let's find your perfect pet."
          : "Address saved successfully!",
      );
      router.push("/pets");
    } catch (error) {
      toast.error("Failed to save preferences. Please try again.");
    }
  }

  return (
    <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Personality & Pet Experience Cards - Adopter only */}
            {isAdopter && (
            <>
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
                  name="personality_tags"
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
                                field.value.filter((id) => id !== tagId),
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
                  name="personality"
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
                  name="pet_experience_tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Experience Tags *</FormLabel>
                      <FormControl>
                        <SearchableCombobox
                          options={petExperienceTags}
                          selectedValues={field.value ?? []}
                          onSelect={(tagId) => {
                            if (!field.value?.includes(tagId)) {
                              field.onChange([...(field.value ?? []), tagId]);
                            }
                          }}
                          onSearch={setPetExperienceSearch}
                          onLoadMore={loadMorePetExperience}
                          isLoading={isLoadingPetExperienceTags}
                          hasMore={hasMorePetExperience}
                          placeholder="Search experience tags..."
                          emptyMessage="No experience tags found."
                          mode="multiple"
                        />
                      </FormControl>
                      <FormMessage />
                      <div className="flex flex-wrap gap-2 mt-2">
                        {field.value?.map((tagId) => (
                          <TagBadge
                            key={tagId}
                            label={petExperienceTagsMap.get(tagId) || tagId}
                            onRemove={() => {
                              field.onChange(
                                field.value?.filter((id) => id !== tagId),
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
                  name="pet_experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Experience Description</FormLabel>
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
            </>
            )}

            {/* Address Card */}
            <Card className="rounded-2xl shadow-md text-left">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Address</CardTitle>
                <CardDescription>
                  Let us know where you live, so we can personalize the search
                  for you.
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
                        <Input
                          placeholder="e.g. Jl. Pawsitive No. 123"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address.province_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Province</FormLabel>
                      <FormControl>
                        <SearchableCombobox
                          options={provinces}
                          selectedValues={field.value ? [field.value] : []}
                          onSelect={(value) => {
                            field.onChange(value);
                            form.setValue("address.regency_id", "");
                            form.setValue("address.district_id", "");
                          }}
                          onSearch={setProvincesSearch}
                          onLoadMore={loadMoreProvinces}
                          isLoading={isLoadingProvinces}
                          hasMore={hasMoreProvinces}
                          placeholder="Select province..."
                          emptyMessage="No provinces found."
                          mode="single"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address.regency_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Regency / City</FormLabel>
                      <FormControl>
                        <SearchableCombobox
                          options={regencies}
                          selectedValues={field.value ? [field.value] : []}
                          onSelect={(value) => {
                            field.onChange(value);
                            form.setValue("address.district_id", "");
                          }}
                          onSearch={setRegenciesSearch}
                          onLoadMore={loadMoreRegencies}
                          isLoading={isLoadingRegencies}
                          hasMore={hasMoreRegencies}
                          placeholder={
                            selectedProvinceId
                              ? "Select regency/city..."
                              : "Select a province first"
                          }
                          emptyMessage="No regencies found."
                          mode="single"
                          disabled={!selectedProvinceId}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="address.district_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>District</FormLabel>
                        <FormControl>
                          <SearchableCombobox
                            options={districts}
                            selectedValues={field.value ? [field.value] : []}
                            onSelect={(value) => field.onChange(value)}
                            onSearch={setDistrictsSearch}
                            onLoadMore={loadMoreDistricts}
                            isLoading={isLoadingDistricts}
                            hasMore={hasMoreDistricts}
                            placeholder={
                              selectedRegencyId
                                ? "Select district..."
                                : "Select a regency first"
                            }
                            emptyMessage="No districts found."
                            mode="single"
                            disabled={!selectedRegencyId}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address.zip_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Zip Code{" "}
                          <span className="text-muted-foreground font-normal">
                            (optional)
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 62704" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address.link"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Maps Link{" "}
                        <span className="text-muted-foreground font-normal">
                          (optional)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. https://maps.google.com/..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address.notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Notes{" "}
                        <span className="text-muted-foreground font-normal">
                          (optional)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the address in more detail..."
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

            {/* Special Needs Checkbox - Adopter only */}
            {isAdopter && (
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
                      Pets with special needs may require extra care and
                      attention.
                    </p>
                  </div>
                </FormItem>
              )}
            />
            )}

            {/* Actions */}
            <div className="flex items-center justify-end pt-2">
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
  );
}
