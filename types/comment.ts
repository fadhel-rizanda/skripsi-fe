import { UserProfile } from "./user";

export interface Comment {
    id: string;
    content: string;
    created_at: string;
    updated_at: string;
    created_by: UserProfile;
    likes_count: number;
    replies_count: number;
    replies?: Comment[];
}
