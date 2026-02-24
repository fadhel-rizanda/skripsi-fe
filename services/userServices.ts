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

    putUsers: async (userId: string, data: Partial<UserProfile>): Promise<UserProfile> => {
        const response = await api.put(`/v1/users/${userId}`, data);
        return response.data;
    },

    saveGreeting: async (userId: string, data: SaveGreetingPayload): Promise<void> => {
        const response = await api.put(`/v1/users/${userId}`, data);
        return response.data;
    },
};
