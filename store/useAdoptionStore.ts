import { create } from 'zustand';

interface AdoptionStore {
    refreshTicket: number;
    triggerAdoptionRefresh: () => void;
}

export const useAdoptionStore = create<AdoptionStore>((set) => ({
    refreshTicket: 0,

    triggerAdoptionRefresh: () => {
        set((state) => ({ refreshTicket: state.refreshTicket + 1 }));
    }
}));