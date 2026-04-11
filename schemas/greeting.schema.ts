import { z } from "zod";
import {AddressSchema} from "@/schemas/address.schema";

const requiredString = (max: number) =>
    z
        .string()
        .trim()
        .min(30, "About must be at least 30 characters")
        .max(max, `Description is too long (max ${max} characters)`);

const requiredMin20String = (fieldName: string, max: number) =>
    z
        .string()
        .trim()
        .min(20, `${fieldName} must be at least 20 characters`)
        .max(max, `Description is too long (max ${max} characters)`);

export const AdopterGreetingSchema = z.object({
    about_me: requiredString(1000),
    personality_tags: z
        .array(z.string().uuid("Invalid personality tag"))
        .min(1, "Select at least one personality trait"),
    personality: requiredMin20String("Personality description", 1000),
    pet_experience: requiredMin20String("Pet experience description", 1000),
    pet_experience_tags: z
        .array(z.string().uuid("Invalid experience tag"))
        .min(1, "Select at least one experience tag"),
    address: AddressSchema,
    open_to_special_needs: z.boolean(),
});

export const ProviderGreetingSchema = z.object({
    about_me: requiredString(1000),
    address: AddressSchema,
});

export type AdopterGreetingFormInput = z.infer<typeof AdopterGreetingSchema>;
export type ProviderGreetingFormInput = z.infer<typeof ProviderGreetingSchema>;
export type GreetingFormInput = AdopterGreetingFormInput | ProviderGreetingFormInput;