import { z } from "zod";

export const createPostSchema = z.object({
    title: z
        .string()
        .min(1, { message: "Title is required" })
        .max(255, { message: "Title must be less than 255 characters" }),
    content: z
        .string()
        .min(1, { message: "Content is required" }),
    community_id: z.string().optional(),
    tag_ids: z.array(z.string()).optional(),
    attachment_id: z.string().optional(),
});

export const updatePostSchema = createPostSchema.partial();

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;


