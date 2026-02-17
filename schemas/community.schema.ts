import { z } from "zod";

export const CreateCommunitySchema = z.object({
    name: z.string().min(1, "Name is required").max(50, "Name is too long"),
    website: z.url("Invalid URL").optional(),
    attachment_id: z.uuid().optional(),
    description: z.string().min(10, "Please provide more details (min 10 characters)"),
    tag_ids: z.array(z.uuid()).min(1, "Select at least one tag"),
    admin_ids: z.array(z.uuid()).optional(),

    address: z.object({
        street: z.string().min(10, "Please provide a street"),
        city: z.string().min(2, "Please provide a city"),
        state: z.string().min(2, "Please provide a state"),
        country: z.string().min(2, "Please provide a country"),
        zip_code: z.string().min(4, "Please provide a zip code").max(10, "Zip code is too long"),
        notes: z.string().max(500, "Note is too long").optional(),
        link: z.url("Invalid URL").optional().or(z.literal("")),
    }),
})

export type CreateCommunityInput = z.infer<typeof CreateCommunitySchema>;
