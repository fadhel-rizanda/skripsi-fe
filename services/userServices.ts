import api from "@/lib/axios";
import { PaginatedResponse, GetAllParams } from "@/types/api";
import { UserProfile } from "@/types/user";

export interface GetUsersParams extends GetAllParams {
    role_id?: string;
    sort_direction?: "asc" | "desc";
}

export interface SaveGreetingPayload {
    personality_ids: string[];
    personality_description?: string;
    pet_experience: string;
    pet_experience_description?: string;
    physique_ids: string[];
    physique_description?: string;
    type_of_animal_ids: string[];
    type_of_animal_description?: string;
    open_to_special_needs: boolean;
}

export const userService = {
    getUsers: async (params?: GetUsersParams): Promise<PaginatedResponse<UserProfile[]>> => {
        const response = await api.get<PaginatedResponse<UserProfile[]>>("/v1/users", { params });
        return response.data;
    },

    putUsers: async (_userId: string, data: SaveGreetingPayload): Promise<void> => {
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
