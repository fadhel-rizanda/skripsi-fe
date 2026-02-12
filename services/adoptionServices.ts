import api from "@/lib/axios";
import {AdoptionFilterState} from "@/types";

export const adoptionServices = {
    getAllAdoptions: async (params: AdoptionFilterState, signal?: AbortSignal) => {
        const response = await api.get("/v1/adoptions", {
            params,
            signal,
        });
        return response.data;
    },
}