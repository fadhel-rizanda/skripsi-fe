import { z } from "zod";

// ─── Requirement ──────────────────────────────────────────────────────────────────
export const CreateRequirementSchema = z.object({
    requirements: z.array(
        z.object({
            name: z.string().min(1, "Name is required"),
            notes: z.string().optional().or(z.literal("")),
        })
    ).min(1, "At least one requirement is required"),
});

export type CreateRequirementInput = z.infer<typeof CreateRequirementSchema>;

export const UpdateRequirementSchema = z.object({
    name: z.string().min(1, "Name is required"),
    notes: z.string().optional().or(z.literal("")),
});

export type UpdateRequirementInput = z.infer<typeof UpdateRequirementSchema>;

export const RejectSchema = z.object({
    notes: z.string().min(5, "Please provide a clear reason for rejection"),
});

export type RejectInput = z.infer<typeof RejectSchema>;

// ─── MeetNGreet ──────────────────────────────────────────────────────────────────
export const CreateMeetNGreetSchema = z.object({
    scheduled_time: z.string().refine((value) => {
        const date = new Date(value);
        return !isNaN(date.getTime()) && date > new Date();
    }),
    address: z.object({
        street: z.string().min(10, "Please provide a street"),
        city: z.string().min(2, "Please provide a city"),
        state: z.string().min(2, "Please provide a state"),
        country: z.string().min(2, "Please provide a country"),
        zip_code: z.string().min(4, "Please provide a zip code").max(10, "Zip code is too long"),
        notes: z.string().max(500, "Note is too long").optional(),
        link: z.url("Invalid URL").optional().or(z.literal("")),
    }),
});

export type CreateMeetNGreetInput = z.infer<typeof CreateMeetNGreetSchema>;
