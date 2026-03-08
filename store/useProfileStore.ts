import { create } from "zustand"

interface ProfileState {
    avatarUrl: string | null
    setAvatarUrl: (url: string | null) => void
}

export const useProfileStore = create<ProfileState>((set) => ({
    avatarUrl: null,
    setAvatarUrl: (url) => set({ avatarUrl: url }),
}))
