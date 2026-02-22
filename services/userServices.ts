import api from "@/lib/axios";
import { PaginatedResponse, GetAllParams } from "@/types/api";
import { UserProfile } from "@/types/user";

export interface GetUsersParams extends GetAllParams {
    role_id?: string;
    sort_direction?: "asc" | "desc";
}

export const userService = {
    getUsers: async (params?: GetUsersParams): Promise<PaginatedResponse<UserProfile[]>> => {
        const response = await api.get<PaginatedResponse<UserProfile[]>>("/v1/users", { params });
        return response.data;
    }
};
