import { UserProfile } from "./user";
import { Tag } from "./general";
import { Attachment } from "./attachment";

export interface Post {
    id: string;
    title: string;
    content: string;
    image_url: string | null;
    attachment: Attachment;
    created_at: string;
    updated_at: string;
    tags: Tag[];
    likes_count: number;
    comments_count: number;
    created_by: UserProfile;
}