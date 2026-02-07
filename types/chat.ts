import {UserProfile} from "@/types/user";
import {Attachment} from "@/types/attachment";

export interface Chat {
    id: string;
    name?: string;
    description?: string;
    type: "public" | "private";
    users: UserProfile[];
    last_message?: Message;
    unread_count: number;
    created_at: string;
    updated_at: string;
    created_by: UserProfile;
    updated_by: UserProfile;
}

export interface Message {
    id: string;
    chat: Chat;
    sender: UserProfile;
    content: string;
    attachment?: Attachment;
    created_at: string;
    updated_at: string;
}