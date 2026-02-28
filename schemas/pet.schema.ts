import {z} from "zod";

export const AddressSchema = z.object({
    street: z.string().min(10, "Street address must be at least 10 characters"),
    province_id: z.string().min(1, "Please select a province"),
    regency_id: z.string().min(1, "Please select a regency / city"),
    district_id: z.string().min(1, "Please select a district"),
    zip_code: z.string().min(4, "Zip code must be at least 4 digits").max(20, "Zip code is too long").optional().or(z.literal("")),
    notes: z.string().max(1000, "Notes must be under 1000 characters").optional(),
    link: z.url("Please enter a valid URL").optional().or(z.literal("")),
});

export const CreatePetSchema = z.object({
    name: z.string().min(1, "Name is required").max(50, "Name is too long"),
    breed: z.string().min(1, "Breed is required").max(255),
    size: z.enum(["small", "medium", "large", "extra large"], { message: "Size is required" }),
    date_of_birth: z.date()
        .min(new Date("1900-01-01"), "Date of Birth is required")
        .max(new Date(), "Date of Birth cannot be in the future"),
    gender: z.enum(["male", "female"], { message: "Gender is required" }),
    about: z.string().min(10, "Please provide more details (min 10 characters)"),
    special_needs: z.boolean().default(false),
    type_of_animal_id: z.string().uuid("Invalid animal type"),
    physique_ids: z.array(z.string().uuid()).min(1, "Select at least one physique tag"),
    personality_ids: z.array(z.string().uuid()).min(1, "Select at least one personality tag"),
    profile_picture_ids: z.array(z.string().uuid()).optional(),
    additional_record_ids: z.array(z.string().uuid()).optional(),
    use_owner_address: z.boolean().optional(),
    address: AddressSchema.optional(),
}).superRefine((data, ctx) => {
    if (data.use_owner_address === true) return;
    const result = AddressSchema.safeParse(data.address ?? {});
    if (!result.success) {
        result.error.issues.forEach((issue) => {
            ctx.addIssue({ ...issue, path: ["address", ...issue.path] });
        });
    }
});

export type CreatePetInput = z.infer<typeof CreatePetSchema>;