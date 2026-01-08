export interface ApiResponse<T = unknown> {
    error:  boolean
    status: string
    message:  string
    data:  T
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
    meta: {
        current_page: number
        total:  number
        per_page: number
    }
}
