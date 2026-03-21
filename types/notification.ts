import {UserProfile} from "@/types/user";

export interface Notification {
    id: string
    title: string
    message: string
    user_id: string
    user: UserProfile
    reference_id: string
    reference_type: string
    created_at: string
    read_at?: string
}