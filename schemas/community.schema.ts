import {z} from "zod";
import {AddressSchema} from "@/schemas/address.schema";

export const CreateCommunitySchema = z.object({
    name: z.string().min(4, "Name must be at least 4 characters").max(50, "Name is too long"),
    website: z.url("Invalid URL").max(255, "Website URL must be less than 255 characters").optional().or(z.literal("")),
    attachment_id: z.uuid().optional(),
    description: z.string().min(10, "Please provide more details (min 10 characters)").max(1000, "Description is too long"),
    tag_ids: z.array(z.uuid()).min(1, "Select at least one tag"),
    admin_ids: z.array(z.uuid()).optional(),

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

export type CreateCommunityInput = z.infer<typeof CreateCommunitySchema>;
