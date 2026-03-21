import { z } from "zod";

export const PresignedUrlSchema = z.object({
    filename: z.string().min(1, "Filename is required"),
    mime_type: z.string().min(1, "Mime type is required"),
    file_size: z.number()
        .int()
        .max(10485760, "File size must not exceed 10MB"),
    is_public: z.boolean().optional().default(true),
});

export type PresignedUrlInput = z.infer<typeof PresignedUrlSchema>;