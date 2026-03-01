import { z } from "zod";

const AddressSchema = z.object({
    street: z.string().min(1, "Street is required").max(500, "Street is too long (max 500 characters)"),
    province_id: z.string().min(1, "Province is required"),
    regency_id: z.string().min(1, "Regency / City is required"),
    district_id: z.string().min(1, "District is required"),
    zip_code: z.string().max(20, "Zip code is too long (max 20 characters)").optional(),
    notes: z.string().max(1000, "Notes is too long (max 1000 characters)").optional(),
    link: z.string().url("Must be a valid URL").max(255).optional().or(z.literal("")),
});

export const AdopterGreetingSchema = z.object({
    personality_ids: z
        .array(z.string().uuid("Invalid personality tag"))
        .min(1, "Select at least one personality trait"),
    personality_description: z
        .string()
        .max(500, "Description is too long (max 500 characters)")
        .optional(),
    pet_experience: z.enum(["none", "beginner", "intermediate", "experienced"], {
        message: "Please select your pet experience level",
    }),
    pet_experience_description: z
        .string()
        .max(500, "Description is too long (max 500 characters)")
        .optional(),
    address: AddressSchema,
    open_to_special_needs: z.boolean(),
});

export const ProviderGreetingSchema = z.object({
    address: AddressSchema,
});

export type AdopterGreetingFormInput = z.infer<typeof AdopterGreetingSchema>;
export type ProviderGreetingFormInput = z.infer<typeof ProviderGreetingSchema>;
export type GreetingFormInput = AdopterGreetingFormInput | ProviderGreetingFormInput;