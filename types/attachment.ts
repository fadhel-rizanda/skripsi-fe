export interface Attachment {
    id: string;
    filename: string;
    path: string;
    file_size: number;
    mime_type: string;
    status: string;
    uploaded_at: string;
    public_url?: string;
    uploaded_by: string;
}