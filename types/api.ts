export interface ApiResponse<T = unknown> {
    error: boolean
    status: string
    message: string
    data: T
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
    meta: {
        current_page: number
        total: number
        per_page: number
    }
}

export interface GetAllParams {
    search?: string
    page?: number
    per_page?: number
    sort_by?: string
    sort_order?: 'asc' | 'desc'
}

export interface AdoptionFilterState extends GetAllParams{
    status_id?: string;
    stage_tag_id?: string;
}