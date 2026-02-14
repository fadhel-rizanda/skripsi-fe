import { z } from "zod";

export const CreatePetSchema = z.object({
    name: z.string().min(1, "Name is required").max(50, "Name is too long"),
    breed: z.string().min(1, "Breed is required").max(255),
    size: z.enum(["small", "medium", "large", "extra large"], {
        message: "Size is required",
    }),
    date_of_birth: z.date()
        .min(new Date("1900-01-01"), "Date of Birth is required")
        .max(new Date(), "Date of Birth cannot be in the future"),
    gender: z.enum(["male", "female"], {
        message: "Gender is required",
    }),
    about: z.string().min(10, "Please provide more details (min 10 characters)"),
    special_needs: z.boolean().default(false),
    type_of_animal_id: z.string().uuid("Invalid animal type"),
    physique_ids: z.array(z.string().uuid()).min(1, "Select at least one physique tag"),
    personality_ids: z.array(z.string().uuid()).min(1, "Select at least one personality tag"),
    profile_picture_ids: z.array(z.string().uuid()).optional(),
    additional_record_ids: z.array(z.string().uuid()).optional(),
})

export type CreatePetInput = z.infer<typeof CreatePetSchema>;
