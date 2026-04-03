import { z } from "zod";

export const CreatePostSchema = z.object({
    title: z
        .string()
        .min(1, { message: "Title is required" })
        .max(255, { message: "Title must be less than 255 characters" }),
    content: z
        .string()
        .min(1, { message: "Content is required" })
        .max(255, { message: "Content must be less than 255 characters" }),
    community_id: z.uuid().optional(),
    tag_ids: z.array(z.uuid()).min(1, { message: "At least one tag is required" }),
    attachment_id: z.uuid().optional(),
});

export const UpdatePostSchema = CreatePostSchema.partial();

export type CreatePostInput = z.infer<typeof CreatePostSchema>;
export type UpdatePostInput = z.infer<typeof UpdatePostSchema>;
