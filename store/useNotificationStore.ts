import { create } from "zustand"

interface NotificationState {
    hasUnread: boolean
    setHasUnread: (value: boolean) => void
    clear: () => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
    hasUnread: false,
    setHasUnread: (value) => set({ hasUnread: value }),
    clear: () => set({ hasUnread: false }),
}))
