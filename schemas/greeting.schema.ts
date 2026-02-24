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
    physique_ids: z
        .array(z.string().uuid("Invalid physique tag"))
        .min(1, "Select at least one physique trait"),
    physique_description: z
        .string()
        .max(500, "Description is too long (max 500 characters)")
        .optional(),
    type_of_animal_ids: z
        .array(z.string().uuid("Invalid animal type"))
        .min(1, "Select at least one preferred animal type"),
    type_of_animal_description: z
        .string()
        .max(500, "Description is too long (max 500 characters)")
        .optional(),
    open_to_special_needs: z.boolean(),
});

export type GreetingFormInput = z.infer<typeof GreetingSchema>;