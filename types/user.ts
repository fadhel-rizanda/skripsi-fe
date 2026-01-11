export interface UserProfile {
    id: string
    name: string
    email: string
    role: Role
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