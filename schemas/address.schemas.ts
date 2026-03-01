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