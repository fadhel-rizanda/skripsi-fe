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