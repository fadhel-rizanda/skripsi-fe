import { z } from "zod";
import { AddressSchema } from "@/schemas/address.schema";

export const ProviderProfileSchema = z.object({
    name: z
        .string()
        .min(4, "Name must be at least 4 characters")
        .max(255, "Name is too long"),
    phone: z
        .string()
        .max(20, "Phone number is too long")
        .optional()
        .or(z.literal("")),
    about_me: z
        .string()
        .trim()
        .min(30, "About must be at least 30 characters")
        .max(1000, "Description is too long (max 1000 characters)"),
    address: AddressSchema,
});

export type ProviderProfileInput = z.infer<typeof ProviderProfileSchema>;

export const AdopterProfileSchema = z.object({
    name: z
        .string()
        .min(4, "Name must be at least 4 characters")
        .max(255, "Name is too long"),
    phone: z
        .string()
        .max(20, "Phone number is too long")
        .optional()
        .or(z.literal("")),
    about_me: z
        .string()
        .trim()
        .min(30, "About must be at least 30 characters")
        .max(1000, "Description is too long (max 1000 characters)"),
    address: AddressSchema,
    personality_tags: z
        .array(z.string().uuid("Invalid personality tag"))
        .min(1, "Select at least one personality trait"),
    personality: z
        .string()
        .trim()
        .min(20, "Personality description must be at least 20 characters")
        .max(1000, "Description is too long (max 1000 characters)"),
    pet_experience_tags: z
        .array(z.string().uuid("Invalid experience tag"))
        .min(1, "Select at least one experience tag"),
    pet_experience: z
        .string()
        .trim()
        .min(20, "Pet experience description must be at least 20 characters")
        .max(1000, "Description is too long (max 1000 characters)"),
    open_to_special_needs: z.boolean(),
});
export type AdopterProfileInput = z.infer<typeof AdopterProfileSchema>;

// Union type for the service
export type UpdateProfilePayload = ProviderProfileInput | AdopterProfileInput;
