import {z} from "zod";

export const AddressSchema = z.object({
    street: z.string().min(10, "Street address must be at least 10 characters").max(255, "Street address must be less than 255 characters"),
    province_id: z.string().min(1, "Please select a province"),
    regency_id: z.string().min(1, "Please select a regency / city"),
    district_id: z.string().min(1, "Please select a district"),
    zip_code: z.string().regex(/^\d{4,20}$/, "Zip code must be between 4 and 20 digits").optional().or(z.literal("")),
    notes: z.string()
        .max(1000, "Notes must be under 1000 characters")
        .refine((val) => val.length === 0 || val.length >= 10, {
            message: "Notes must be at least 10 characters if provided",
        })
        .optional(),
    link: z.url("Please enter a valid URL").max(255, "Link address must be less than 255 characters").optional().or(z.literal("")),
});