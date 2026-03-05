import { z } from "zod";
import { AddressSchema } from "@/schemas/address.schema";

const optionalString = (max: number) =>
    z.string().max(max).optional().or(z.literal(""));

// Shared base fields for both adopter & provider
const baseProfileFields = {
    name: z.string().min(1, "Name is required").max(255, "Name is too long"),
    phone: optionalString(20),
    about_me: optionalString(1000),
    address: AddressSchema,
};

// Provider only needs base fields
export const ProviderProfileSchema = z.object(baseProfileFields);
export type ProviderProfileInput = z.infer<typeof ProviderProfileSchema>;

// Adopter has base + background fields (aligned with greeting form)
export const AdopterProfileSchema = z.object({
    ...baseProfileFields,
    personality_tags: z
        .array(z.string().uuid("Invalid personality tag"))
        .min(1, "Select at least one personality trait"),
    personality: optionalString(1000),
    pet_experience: z.enum(["none", "beginner", "intermediate", "experienced"], {
        message: "Please select your pet experience level",
    }),
    pet_experience_description: optionalString(500),
    open_to_special_needs: z.boolean(),
});
export type AdopterProfileInput = z.infer<typeof AdopterProfileSchema>;

// Union type for the service
export type UpdateProfilePayload = ProviderProfileInput | AdopterProfileInput;
