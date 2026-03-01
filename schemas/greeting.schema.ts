import { z } from "zod";

export const GreetingSchema = z.object({
    personality_ids: z
        .array(z.string().uuid("Invalid personality tag"))
        .min(1, "Select at least one personality trait"),
    personality_description: z
        .string()
        .max(500, "Description is too long (max 500 characters)")
        .optional(),
    pet_experience: z.enum(["none", "beginner", "intermediate", "experienced"], {
        error: () => "Please select your pet experience level",
    }),
    pet_experience_description: z
        .string()
        .max(500, "Description is too long (max 500 characters)")
        .optional(),
    address: z.object({
        street: z.string().max(500, "Street is too long (max 500 characters)").optional(),
        city: z.string().max(100, "City is too long (max 100 characters)").optional(),
        state: z.string().max(100, "State is too long (max 100 characters)").optional(),
        zip_code: z.string().max(20, "Zip code is too long (max 20 characters)").optional(),
        country: z.string().max(100, "Country is too long (max 100 characters)").optional(),
    }).optional(),
    open_to_special_needs: z.boolean(),
});

export type GreetingFormInput = z.infer<typeof GreetingSchema>;