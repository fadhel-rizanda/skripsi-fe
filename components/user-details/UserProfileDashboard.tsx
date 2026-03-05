"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Icon } from "@iconify/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { SearchableCombobox } from "@/components/combobox/SearchableCombobox";
import { TagBadge } from "@/components/badge/TagBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PET_EXPERIENCE_OPTIONS } from "@/constant/pet-experience";
import { PetCard } from "@/components/card/PetCard";
import { PaginationBar } from "@/components/pagination/PaginationBar";

import { userService } from "@/services/userServices";
import { petService } from "@/services/petServices";
import {
  useTagsOptions,
  useProvincesOptions,
  useRegenciesOptions,
  useDistrictsOptions,
} from "@/hooks/useFilterOptions";
import { TAG_TYPE } from "@/constant/tag-type";
import {
  AdopterProfileSchema,
  ProviderProfileSchema,
  AdopterProfileInput,
} from "@/schemas/edit-profile.schema";
import { UserDetail } from "@/types/user";
import { Pet } from "@/types/pet";

export default function UserProfileDashboard({ userId }: { userId: string }) {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const isOwnProfile = !!session?.user?.id && session.user.id === userId;
  const isAdopter =
    (profile?.role_name ?? session?.user?.role?.name) === "adopter";

  // Provider: pet listing state
  const [pets, setPets] = useState<Pet[]>([]);
  const [petPage, setPetPage] = useState(1);
  const [petPerPage, setPetPerPage] = useState(10);
  const [petTotal, setPetTotal] = useState(0);
  const [isPetsLoading, setIsPetsLoading] = useState(true);

  // Tag options — hooks must always be called unconditionally
  const {
    options: personalityTagOptions,
    isLoading: isLoadingPersonality,
    setSearch: setPersonalitySearch,
    loadMore: loadMorePersonality,
    hasMore: hasMorePersonality,
  } = useTagsOptions(TAG_TYPE.USER.PERSONALITY);
  const personalityTagsMap = useMemo(
    () => new Map(personalityTagOptions.map((t) => [t.id, t.name])),
    [personalityTagOptions],
  );

  const form = useForm<AdopterProfileInput>({
    resolver: zodResolver(
      isAdopter ? AdopterProfileSchema : ProviderProfileSchema,
    ) as any,
    defaultValues: {
      name: "",
      phone: "",
      about_me: "",
      address: {
        street: "",
        province_id: "",
        regency_id: "",
        district_id: "",
        zip_code: "",
        notes: "",
        link: "",
      },
      personality: "",
      personality_tags: [],
      pet_experience: undefined,
      pet_experience_description: "",
      open_to_special_needs: false,
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

  function resetFormFromProfile(data: UserDetail | null) {
    if (!data) return;
    const addr = data.address;
    form.reset({
        name: data.name ?? "",
        phone: data.phone ?? "",
        about_me: data.about_me ?? "",
        address: {
            street: addr?.street ?? "",
            province_id: addr?.province_id ?? "",
            regency_id: addr?.regency_id ?? "",
            district_id: addr?.district_id ?? "",
            zip_code: addr?.zip_code ?? "",
            notes: addr?.notes ?? "",
            link: addr?.link ?? "",
        },
        personality: data.personality ?? "",
        personality_tags: data.personality_tags?.map((t: any) => t.id) ?? [],
        pet_experience: (data.pet_experience as any) ?? undefined,
        pet_experience_description: data.pet_experience_description ?? "",
        open_to_special_needs: data.open_to_special_needs ?? false,
    });
}

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;
      try {
        const data = await userService.getUserById(userId);
        setProfile(data);
        resetFormFromProfile(data);
      } catch (error) {
        toast.error("Failed to load profile. Please try again.");
        console.error("Failed to fetch profile:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  // Provider: fetch pets (own profile only)
  const fetchPets = useCallback(async () => {
    setIsPetsLoading(true);
    try {
      const res = await petService.getPets({
        page: petPage,
        per_page: petPerPage,
      });
      setPets(res.data ?? []);
      setPetTotal(res.total ?? 0);
    } catch (error) {
      toast.error("Failed to load pets.");
      console.error("Failed to fetch pets:", error);
    } finally {
      setIsPetsLoading(false);
    }
  }, [petPage, petPerPage]);

  useEffect(() => {
    if (!isAdopter && isOwnProfile) fetchPets();
  }, [fetchPets, isAdopter, isOwnProfile]);

  async function onSubmit(values: AdopterProfileInput) {
    if (!isOwnProfile) return;

    try {
        let payload: Record<string, any> = { ...values };

        if (!isAdopter) {
            const { personality, personality_tags, pet_experience, pet_experience_description, open_to_special_needs, ...providerData } = payload;
            payload = providerData;
        }

        await userService.putUsers(payload as any);

        const refreshed = await userService.getUserById(userId);
        setProfile(refreshed);
        resetFormFromProfile(refreshed);
        setIsEditing(false);
        toast.success("Profile updated successfully!");
    } catch (err) {
        console.error(err);
        toast.error("Failed to update profile.");
    }
}

  function handleCancel() {
    resetFormFromProfile(profile);
    setIsEditing(false);
  }

  if (isLoading)
    return (
      <div className="p-10 text-center">
        <Icon icon="ph:circle-notch" className="w-8 h-8 animate-spin mx-auto" />
      </div>
    );

  if (!profile)
    return (
      <div className="p-10 text-center text-muted-foreground">
        Failed to load profile.
      </div>
    );

  const joinedYear = new Date(profile.created_at).getFullYear();

  return (
    <div className="min-h-screen bg-green-50 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Single unified card: header + all form sections */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Profile Header */}
          <div className="flex items-center gap-6 p-6 border-b border-gray-100">
            <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center shrink-0">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Icon
                  icon="ph:user-circle"
                  className="w-12 h-12 text-gray-400"
                />
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{profile.name}</h1>
              {isAdopter ? (
                <p className="text-green-600 font-semibold mt-0.5">Adopter</p>
              ) : (
                <p className="text-blue-600 font-semibold mt-0.5">Provider</p>
              )}
              <p className="text-sm text-muted-foreground mt-0.5">
                Joined in {joinedYear}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {isOwnProfile && !isEditing && (
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Icon icon="ph:pencil" className="mr-2 w-4 h-4" />
                  Edit Profile
                </Button>
              )}
              {isOwnProfile && (
                <Button variant="destructive" onClick={() => signOut()}>
                  Logout
                </Button>
              )}
            </div>
          </div>

          {/* Form sections */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              {/* Personal Information */}
              {isOwnProfile && <SectionCard
                title="Personal Information"
                description="Update your photo and personal details here."
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="hidden">
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="space-y-4">
                  <div>
                    <FormLabel className="text-sm font-medium">
                      Email address
                    </FormLabel>
                    <Input
                      value={profile.email}
                      readOnly
                      className="mt-1.5 bg-gray-50"
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="555-123-4567"
                            readOnly={!isEditing}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </SectionCard>}

              {/* Address */}
              {isOwnProfile && <SectionCard
                title="Address"
                description={
                  isAdopter
                    ? "Your home address."
                    : "Your shelter / organization address."
                }
              >
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="address.street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street address</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Jl. Pawsitive No. 123"
                            readOnly={!isEditing}
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
                            disabled={!isEditing}
                            className="disabled:opacity-100"
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
                            disabled={!isEditing || !selectedProvinceId}
                            className="disabled:opacity-100"
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
                              disabled={!isEditing || !selectedRegencyId}
                              className="disabled:opacity-100"
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
                          <FormLabel>ZIP / Postal code</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. 62704"
                              readOnly={!isEditing}
                              {...field}
                            />
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
                        <FormLabel>Maps link</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. https://maps.google.com/..."
                            readOnly={!isEditing}
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
                        <FormLabel>Address notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the address in more detail..."
                            className="resize-none"
                            rows={3}
                            readOnly={!isEditing}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </SectionCard>}

              {/* About */}
              <SectionCard
                title="About"
                description={
                  isAdopter
                    ? "Tell us more about you."
                    : "Tell us about your organization."
                }
              >
                <FormField
                  control={form.control}
                  name="about_me"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {isAdopter ? "About me" : "About our shelter"}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={
                            isAdopter
                              ? "I'm an experienced dog owner looking for a new furry friend..."
                              : "We are a no-kill shelter focused on..."
                          }
                          className="resize-none"
                          rows={5}
                          readOnly={!isEditing}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </SectionCard>

              {/* Adopter-only: Pet Experience, Personality, Pet Preferences */}
              {isAdopter && (
                <>
                  <SectionCard
                    title="Personality"
                    description="Tell us more about yourself. This is optional."
                  >
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
                                readOnly={!isEditing}
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
                              {field.value?.map((tagId) => (
                                <TagBadge
                                  key={tagId}
                                  label={personalityTagsMap.get(tagId) || tagId}
                                  onRemove={
                                    isEditing
                                      ? () =>
                                          field.onChange(
                                            field.value?.filter(
                                              (id) => id !== tagId,
                                            ),
                                          )
                                      : undefined
                                  }
                                />
                              ))}
                              {isEditing && (
                                <SearchableCombobox
                                  options={personalityTagOptions}
                                  selectedValues={field.value ?? []}
                                  onSelect={(tagId) => {
                                    if (!field.value?.includes(tagId))
                                      field.onChange([
                                        ...(field.value ?? []),
                                        tagId,
                                      ]);
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

                  <SectionCard
                    title="Pet Experience"
                    description="Tell us more about your experience."
                  >
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="pet_experience"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Experience Level *</FormLabel>
                            <Select
                              disabled={!isEditing}
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="disabled:opacity-100">
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
                                rows={4}
                                readOnly={!isEditing}
                                {...field}
                              />
                            </FormControl>
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
                                className="disabled:opacity-100"
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
                </>
              )}

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? (
                      <>
                        <Icon
                          icon="ph:circle-notch"
                          className="mr-2 w-4 h-4 animate-spin"
                        />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              )}
            </form>
          </Form>
        </div>

        {/* Provider-only: Our Animals (own profile only) */}
        {!isAdopter && isOwnProfile && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold mb-6">Our animals</h2>
            {isPetsLoading ? (
              <div className="py-10 text-center">
                <Icon
                  icon="ph:circle-notch"
                  className="w-8 h-8 animate-spin mx-auto text-gray-400"
                />
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
                        setPetPerPage(n);
                        setPetPage(1);
                      }}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}

        <div className="pb-8" />
      </div>
    </div>
  );
}

/* ---------- Shared section card ---------- */
function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 p-6 border-b border-gray-100">
      <div>
        <h2 className="text-base font-semibold">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}
