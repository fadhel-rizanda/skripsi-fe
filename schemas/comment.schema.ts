import { z } from "zod";

export const createCommentSchema = z.object({
    content: z.string()
        .max(10000, "Message is too long")
        .optional()
        .or(z.literal("")),
    post_id: z.string().uuid(),
    parent_id: z.string().uuid().optional(),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
