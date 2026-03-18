import api from "@/lib/axios";
import { ApiResponse, PaginatedResponse, GetAllParams } from "@/types/api";
import { UserProfile, UserDetail } from "@/types/user";
import { GreetingFormInput } from "@/schemas/greeting.schema";
import { UpdateProfilePayload } from "@/schemas/edit-profile.schema";

export interface GetUsersParams extends GetAllParams {
    role_id?: string;
    sort_direction?: "asc" | "desc";
}

export const userService = {
    getUsers: async (params?: GetUsersParams): Promise<PaginatedResponse<UserProfile[]>> => {
        const response = await api.get<PaginatedResponse<UserProfile[]>>("/v1/users", { params });
        return response.data;
    },

    getUserById: async (userId: string): Promise<UserDetail> => {
        const response = await api.get<ApiResponse<UserDetail>>(`/v1/users/${userId}`);
        return response.data.data;
    },

    putUsers: async (data: GreetingFormInput | UpdateProfilePayload): Promise<void> => {
        const response = await api.put("/v1/profile", data);
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

};
