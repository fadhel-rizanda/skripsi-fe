import api from "@/lib/axios";
import { PaginatedResponse, GetAllParams } from "@/types/api";
import { UserProfile } from "@/types/user";
import { GreetingFormInput } from "@/schemas/greeting.schema";

export interface GetUsersParams extends GetAllParams {
    role_id?: string;
    sort_direction?: "asc" | "desc";
}

export const userService = {
    getUsers: async (params?: GetUsersParams): Promise<PaginatedResponse<UserProfile[]>> => {
        const response = await api.get<PaginatedResponse<UserProfile[]>>("/v1/users", { params });
        return response.data;
    },

    putUsers: async (_userId: string, data: GreetingFormInput): Promise<void> => {
        const payload = {
            personality_tags: data.personality_ids,
            personality: data.personality_description,
            pet_experience: data.pet_experience,
            pet_experience_description: data.pet_experience_description,
            pet_preferences_tags: [...data.physique_ids, ...data.type_of_animal_ids],
            pet_preferences: [data.physique_description, data.type_of_animal_description]
                .filter(Boolean)
                .join(" | ") || undefined,
            open_to_special_needs: data.open_to_special_needs,
        };
        const response = await api.put("/v1/profile", payload);
        return response.data;
    },
    deactivateUser: async (userId: string, notes: string): Promise<void> => {
        await api.post(`/v1/users/${userId}/deactivate`, { notes });
    },

    activateUser: async (userId: string, notes: string): Promise<void> => {
        await api.post(`/v1/users/${userId}/activate`, { notes });
    },

    userChannels: async (): Promise<{ channels: string[] }> => {
        const response = await api.get<{ channels: string[] }>(`/v1/users/channels`);
        return response.data;
    },

    putUsers: async (_userId: string, data: GreetingFormInput): Promise<void> => {
        const payload = {
            personality_tags: data.personality_ids,
            personality: data.personality_description,
            pet_experience: data.pet_experience,
            pet_experience_description: data.pet_experience_description,
            pet_preferences_tags: [...data.physique_ids, ...data.type_of_animal_ids],
            pet_preferences: [data.physique_description, data.type_of_animal_description]
                .filter(Boolean)
                .join(" | ") || undefined,
            open_to_special_needs: data.open_to_special_needs,
        };
        const response = await api.put("/v1/profile", payload);
        return response.data;
    },
};
