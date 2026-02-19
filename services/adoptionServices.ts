import api from "@/lib/axios";
import {AdoptionFilterState, PaginatedResponse} from "@/types";
import {Adoption} from "@/types/adoption";

export const adoptionServices = {
    getAllAdoptions: async (params: AdoptionFilterState, signal?: AbortSignal): Promise<PaginatedResponse<Adoption[]>> => {
        const response = await api.get("/v1/adoptions", {params, signal});
        return response.data;
    },
}