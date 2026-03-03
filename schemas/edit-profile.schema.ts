import { z } from "zod";

const optionalString = (max: number) =>
    z.string().max(max).optional().or(z.literal(""));

// Shared base fields for both adopter & provider
const baseProfileFields = {
    name: z.string().min(1, "Name is required").max(255, "Name is too long"),
    phone: optionalString(20),
    about_me: optionalString(1000),
    // Address
    street: optionalString(500),
    province_id: optionalString(100),
    regency_id: optionalString(100),
    district_id: optionalString(100),
    zip_code: optionalString(20),
    notes: optionalString(500),
    link: optionalString(500),
};

// Provider only needs base fields
export const ProviderProfileSchema = z.object(baseProfileFields);
export type ProviderProfileInput = z.infer<typeof ProviderProfileSchema>;

// Adopter has base + background/preference fields
export const AdopterProfileSchema = z.object({
    ...baseProfileFields,
    // Background
    personality: optionalString(1000),
    pet_experience: optionalString(1000),
    pet_preferences: optionalString(1000),
    personality_tags: z.array(z.string().uuid()),
    pet_experience_tags: z.array(z.string()),
    pet_preferences_tags: z.array(z.string().uuid()),
    open_to_special_needs: z.boolean(),
});
export type AdopterProfileInput = z.infer<typeof AdopterProfileSchema>;

// Union type for the service
export type UpdateProfilePayload = ProviderProfileInput | AdopterProfileInput;
