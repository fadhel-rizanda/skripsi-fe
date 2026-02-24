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
    status: boolean
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