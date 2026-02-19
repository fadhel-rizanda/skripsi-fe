import { z } from "zod";

export const CreateCommentSchema = z.object({
    content: z
        .string()
        .min(1, { message: "Content is required" })
        .max(10000, { message: "Content must be less than 10000 characters" }),
    post_id: z.string().uuid(),
    parent_id: z.string().uuid().optional(),
});

export type CreateCommentInput = z.infer<typeof CreateCommentSchema>;
