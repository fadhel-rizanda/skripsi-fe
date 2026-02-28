import {UserProfile} from "@/types/user";

export interface Status {
    id: string;
    name: string;
    color_code?: string | null;
}
export interface Tag {
    id: string;
    name: string;
    color_code?: string | null;
}
export interface Address {
    street: string;
    city: string;
    state: string;
    country: string;
    zip_code: string;
    notes?: string;
    link?: string;
}
export interface Schedule {
    id: string;
    scheduled_time: string;
    address_id: string;
    address: Address;
    created_by: string | UserProfile;
    updated_by: string | UserProfile;
}

export interface Province {
    id: string;
    name: string;
}

export interface Regency {
    id: string;
    name: string;
    province_id: string;
}

export interface District {
    id: string;
    name: string;
    regency_id: string;
}