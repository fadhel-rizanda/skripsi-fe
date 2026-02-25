export interface UserProfile {
    id: string
    name: string
    email: string
    role: Role
    role_name: string
    channels: Channel[]
    avatar?: string
    created_at: string
    updated_at: string
    phone: string
    is_active: boolean
}

export interface Tag {
    id: string
    name: string
    type: string
    color_code?: string
}

export interface UserAddress {
    id?: string
    street?: string
    city?: string
    state?: string
    zip_code?: string
    country?: string
    notes?: string
    link?: string
}

export interface UserDetail {
    id: string
    name: string
    email: string
    phone?: string
    about_me?: string
    avatar?: string
    street?: string
    address?: UserAddress
    role_name: string
    personality?: string
    pet_experience?: string
    pet_preferences?: string
    personality_tags: Tag[]
    pet_experience_tags: Tag[]
    pet_preferences_tags: Tag[]
    open_to_special_needs: boolean
    created_at: string
    updated_at: string
}

export interface Tag {
    id: string
    name: string
    type: string
    color_code?: string
}

export interface UserAddress {
    id?: string
    street?: string
    city?: string
    state?: string
    zip_code?: string
    country?: string
    notes?: string
    link?: string
}

export interface UserDetail {
    id: string
    name: string
    email: string
    phone?: string
    about_me?: string
    avatar?: string
    street?: string
    address?: UserAddress
    role_name: string
    personality?: string
    pet_experience?: string
    pet_preferences?: string
    personality_tags: Tag[]
    pet_experience_tags: Tag[]
    pet_preferences_tags: Tag[]
    open_to_special_needs: boolean
    created_at: string
    updated_at: string
}

export interface Role {
    id: string
    name: string
    permissions: Permission[]
}

export interface Permission {
    id: string
    name: string
}

export interface Channel {
    name: string
    event: string
}