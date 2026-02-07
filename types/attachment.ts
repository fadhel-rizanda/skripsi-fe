import {UserProfile} from "@/types/user";

export interface Attachment {
    id: string;
    filename: string;
    path: string;
    file_size: number;
    mime_type: string;
    status: string;
    uploaded_at: string;
    public_url?: string;
    updated_by: UserProfile;
}