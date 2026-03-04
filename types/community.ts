import { Address, Status, Tag } from "@/types/general";
import { UserProfile } from "@/types/user";
import { Attachment } from "@/types/attachment";

export interface Community {
    id: string;
    name: string;
    description: string;
    website?: string;
    attachment?: Attachment;
    image_url?: string;
    tags: Tag[];
    admins: UserProfile[];
    members_count: number;
    address: Address;
    status: Status;
    created_at: string;
    updated_at: string;
    is_member: boolean;
    is_admin: boolean;
    is_active: boolean;
}