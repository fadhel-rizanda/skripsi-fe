import { z } from "zod";

// ─── Requirement ──────────────────────────────────────────────────────────────────
export const CreateRequirementSchema = z.object({
    requirements: z.array(
        z.object({
            name: z.string().min(1, "Name is required"),
            notes: z.string().optional().or(z.literal("")),
            tag_id: z.uuid(),
        })
    ).min(1, "At least one requirement is required"),
});

export type CreateRequirementInput = z.infer<typeof CreateRequirementSchema>;

export const UpdateRequirementSchema = z.object({
    name: z.string().min(1, "Name is required"),
    notes: z.string().optional().or(z.literal("")),
    tag_id: z.uuid(),
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
        street: z.string(),
        province_id: z.string().min(1, "Please select a province"),
        regency_id:  z.string().min(1, "Please select a regency / city"),
        district_id: z.string().min(1, "Please select a district"),
        zip_code: z.string()
            .min(4, "Zip code must be at least 4 digits")
            .max(20, "Zip code is too long")
            .optional()
            .or(z.literal("")),
        notes: z.string().max(1000, "Notes must be under 1000 characters").optional(),
        link: z.url("Please enter a valid URL").optional().or(z.literal("")),
    }).superRefine((address, ctx) => {
        const isOnline =
            address.province_id === "1" &&
            address.regency_id  === "1" &&
            address.district_id === "1"

        const streetValue = address.street?.trim() ?? ""

        if (isOnline) {
            if (streetValue.length === 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["street"],
                    message: "Meeting title is required",
                })
            }
        } else if (streetValue.length < 10) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["street"],
                message: "Street address must be at least 10 characters",
            })
        }

        if (isOnline && (!address.link || address.link.trim() === "")) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["link"],
                message: "Meeting link is required for online meetings",
            })
        }
    }),
});

export type CreateMeetNGreetInput = z.infer<typeof CreateMeetNGreetSchema>;
