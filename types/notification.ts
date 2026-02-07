export interface Notification {
    id: string
    reference_id: string
    reference_by: string
    title: string
    message: string
    created_at: string
    read_at?: string
}