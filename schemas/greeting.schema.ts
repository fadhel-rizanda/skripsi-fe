import { z } from "zod";
import {AddressSchema} from "@/schemas/address.schema";

export const AdopterGreetingSchema = z.object({
    personality_tags: z
        .array(z.string().uuid("Invalid personality tag"))
        .min(1, "Select at least one personality trait"),
    personality: z
        .string()
        .max(500, "Description is too long (max 500 characters)")
        .optional(),
    pet_experience: z.enum(["none", "beginner", "intermediate", "experienced"], {
        message: "Please select your pet experience level",
    }),
    pet_experience_description: z
        .string()
        .max(500, "Description is too long (max 500 characters)")
        .optional(),
    address: AddressSchema,
    open_to_special_needs: z.boolean(),
});

export const ProviderGreetingSchema = z.object({
    address: AddressSchema,
});

export type AdopterGreetingFormInput = z.infer<typeof AdopterGreetingSchema>;
export type ProviderGreetingFormInput = z.infer<typeof ProviderGreetingSchema>;
export type GreetingFormInput = AdopterGreetingFormInput | ProviderGreetingFormInput;