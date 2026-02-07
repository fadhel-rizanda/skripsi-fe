export interface UserProfile {
    id: string
    name: string
    email: string
    role: Role
    channels: Channel[]
    avatar?: string
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