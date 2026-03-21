import {GetAllParams} from "@/types";
import api from "@/lib/axios";
import {CreateCommunityInput} from "@/schemas/community.schema";
import {Community} from "@/types/community";

export interface GetCommunityParams extends GetAllParams {
    tag_id?: string;
    sort_direction?: "asc" | "desc";
    [key: string]: any;
}

export const communityService = {
    getCommunities: async (params: GetCommunityParams, signal?: AbortSignal) => {
        const response = await api.get("/api/v1/communities", {
            params,
            signal,
        });
        return response.data;
    },

    getCommunityById: async (id: string | number): Promise<Community> => {
        const response = await api(`/api/v1/communities/${id}`);
        return response.data.data as Community;
    },

    createCommunity: async (data: CreateCommunityInput) => {
        const response = await api.post("/api/v1/communities", data);
        return response.data;
    },

    updateCommunity: async (id: string, data: Partial<CreateCommunityInput>) => {
        const response = await api.put(`/api/v1/communities/${id}`, data);
        return response.data;
    },

    deleteCommunity: async (id: string): Promise<void> => {
        await api.delete(`/api/v1/communities/${id}`);
    },

    followCommunity: async (id: string) => {
        const response = await api.post(`/api/v1/communities/${id}/follow`);
        return response.data;
    },

    takedownCommunity: async (id: string, notes: string): Promise<void> => {
        const encodedId = encodeURIComponent(id);
        await api.post(`/api/v1/communities/${encodedId}/takedown`, { notes });
    },

    restoreCommunity: async (id: string, notes: string): Promise<void> => {
        const encodedId = encodeURIComponent(id);
        await api.post(`/api/v1/communities/${encodedId}/restore`, { notes });
    },
}