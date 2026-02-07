import { z } from "zod";

export const CreateChatSchema = z.object({
    type: z.enum(["public", "private"]),
    name: z.string().max(255).optional().or(z.literal("")),
    description: z.string().max(1000).optional().nullable(),
    user_ids: z.array(z.uuid()).min(1),
}).refine((data) => {
    return !(data.type === "public" && (!data.name || data.name.trim() === ""));

}, {
    message: "Name is required for public chats",
    path: ["name"],
});

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