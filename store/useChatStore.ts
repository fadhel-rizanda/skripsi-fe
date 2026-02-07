import { create } from 'zustand';
import { Chat } from '@/types/chat';

interface ChatState {
    chats: Chat[];
    setChats: (chats: Chat[] | ((prev: Chat[]) => Chat[])) => void;
    refreshTrigger: number;
    triggerRefresh: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
    chats: [],
    setChats: (update) => set((state) => ({
        chats: typeof update === 'function' ? update(state.chats) : update,
    })),
    refreshTrigger: 0,
    triggerRefresh: () => set((state) => ({ refreshTrigger: state.refreshTrigger + 1 })),
}));