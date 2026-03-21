import {create} from 'zustand';

interface AdoptionStore {
    refreshTicket: number;
    meetNGreetTicket: number;
    reviewTicket: number;
    handoverTicket: number;

    triggerAdoptionRefresh: () => void;
    triggerMeetNGreetRefresh: () => void;
    triggerReviewRefresh: () => void;
    triggerHandoverRefresh: () => void;
}

export const useAdoptionStore = create<AdoptionStore>((set) => ({
    refreshTicket: 0,
    meetNGreetTicket: 0,
    reviewTicket: 0,
    handoverTicket: 0,

    triggerAdoptionRefresh: () =>
        set((state) => ({refreshTicket: state.refreshTicket + 1})),
    triggerMeetNGreetRefresh: () =>
        set((state) => ({meetNGreetTicket: state.meetNGreetTicket + 1})),
    triggerReviewRefresh: () =>
        set((state) => ({reviewTicket: state.reviewTicket + 1})),
    triggerHandoverRefresh: () =>
        set((state) => ({handoverTicket: state.handoverTicket + 1})),
}));