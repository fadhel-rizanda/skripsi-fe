import {Schedule, Status, Tag} from "@/types/general";
import {Pet} from "@/types/pet";
import {UserProfile} from "@/types/user";
import {Attachment} from "@/types/attachment";

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
    meet_n_greet?: MeetNGreet;
    handover?: Handover;
}

export interface Requirement {
    id: string;
    name: string;
    notes?: string;
    adoption_id: string;
    adoption: Adoption;
    attachment_id?: string;
    attachment: Attachment;
    status_id: string;
    status: Status;
    created_at: string;
    updated_at: string;
    created_by: UserProfile;
    updated_by: UserProfile;
    is_active: boolean;
    tag_id: string;
    tag: Tag;
}

export interface MeetNGreet {
    id: string;
    adoption_id: string;
    adoption: Adoption;
    schedule_id: string;
    schedule: Schedule
    status_id: string;
    status: Status;
    adopter_confirmed: boolean;
    provider_confirmed: boolean;
    adopter_confirmed_at: string;
    provider_confirmed_at: string;
    created_at: string;
    updated_at: string;
    created_by: UserProfile;
    updated_by: UserProfile;
    is_active: boolean;
}

export interface Handover {
    id: string;
    adoption_id: string;
    adoption: Adoption;
    meet_n_greet_id: string;
    meet_n_greet: MeetNGreet;
    status_id: string;
    status: Status;
    adopter_finalized: boolean;
    provider_finalized: boolean;
    admin_finalized: boolean;
    adopter_finalized_at: string;
    provider_finalized_at: string;
    admin_finalized_at: string;
    created_at: string;
    updated_at: string;
    created_by: UserProfile;
    updated_by: UserProfile;
    is_active: boolean;
    attachments: Attachment[];
}