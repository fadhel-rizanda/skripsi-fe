import api from "@/lib/axios";
import {GetAllParams, PaginatedResponse} from "@/types";
import {Report} from "@/types/general";

export interface GetReportParams extends GetAllParams {
    reference_type?: string;
    tag_id?: string;
    sort_direction?: "asc" | "desc";
}

export const reportServices = {
    getReports: async (params:GetReportParams, signal?: AbortSignal): Promise<PaginatedResponse<Report[]>> => {
        const response = await api.get("/v1/reports", { params, signal });
        return response.data;
    },
}