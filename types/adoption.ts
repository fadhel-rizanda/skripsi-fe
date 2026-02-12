import {Status, Tag} from "@/types/general";
import {Pet} from "@/types/pet";
import {UserProfile} from "@/types/user";

export interface Adoption {
    id: string;
    is_active: boolean;
    status: Status;
    stage_tag: Tag
    pet: Pet
    provider: UserProfile;
    adopter: UserProfile;
    created_at: string;
    updated_at: string;
    updated_by: string;
}
