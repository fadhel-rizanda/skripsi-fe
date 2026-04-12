import {z} from "zod";

export const CreateChatSchema = z.object({
    type: z.enum(["public", "private"]),
    name: z.string().max(255).optional().or(z.literal("")),
    description: z.string().max(1000).optional().nullable(),
    user_ids: z.array(z.string().uuid()).min(1, "Select at least one user"),
    is_create_manually: z.boolean(),
})
    .superRefine((data, ctx) => {
        if ((data.type === "public" || data.is_create_manually) && !data.name?.trim()) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Name is required",
                path: ["name"],
            })
        }

        if (data.type === "private" && data.user_ids.length > 1) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Private chat can only have 1 member",
                path: ["user_ids"],
            })
        }

        if (data.type === "public" && data.user_ids.length < 2) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Public chat requires at least 2 members",
                path: ["user_ids"],
            })
        }
    })

export type CreateChatInput = z.infer<typeof CreateChatSchema>;

export const SendMessageSchema = z.object({
    content: z.string()
        .max(10000, "Message is too long")
        .optional()
        .or(z.literal("")),

    attachment_id: z.string().uuid().optional().nullable(),
}).refine((data) => {
    const hasContent = data.content && data.content.trim().length > 0;
    const hasAttachment = data.attachment_id !== null && data.attachment_id !== undefined;

    return hasContent || hasAttachment;
}, {
    message: "Please enter a message or attach a file",
    path: ["content"],
});

export type SendMessageInput = z.infer<typeof SendMessageSchema>;