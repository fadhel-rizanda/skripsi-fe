import { z } from "zod";

export const CreateCommentSchema = z.object({
    content: z
        .string()
        .min(10, { message: "Content must be at least 10 characters" })
        .max(2000, { message: "Content must be less than 2000 characters" }),
    parent_id: z.string().uuid().optional(),
});

export type CreateCommentInput = z.infer<typeof CreateCommentSchema>;
