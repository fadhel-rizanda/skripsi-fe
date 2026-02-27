"use client";

import AdoptionHeader from "@/components/adoption/AdoptionHeader";
import SubmittedCollapsible from "@/components/adoption/SubmittedCollapsible";
import {Adoption} from "@/types/adoption";
import MeetNGreetCollapsible from "@/components/adoption/MeetNGreetCollapsible";
import HandoverCollapsible from "@/components/adoption/HandoverCollapsible";
import ReviewedCollapsible from "@/components/adoption/ReviewedCollapsible";
import {adoptionServices} from "@/services/adoptionServices";
import {useParams, useRouter} from "next/navigation";
import {useCallback, useEffect, useState} from "react";
import {toast} from "sonner";
import {useSession} from "next-auth/react";
import {useAdoptionStore} from "@/store/useAdoptionStore";

export default function AdoptionDetailPage() {
    const params = useParams();
    const adoptionId = params.id as string;
    const router = useRouter();
    const [adoption, setAdoption] = useState<Adoption | null>(null);
    const { data: session } = useSession();
    const { refreshTicket } = useAdoptionStore();

    const fetchAdoptionDetail = useCallback(async () => {
        try {
            const response = await adoptionServices.getAdoptionById(adoptionId!);
            setAdoption(response.data);
        } catch (error: unknown) {
            console.error("Failed to fetch adoption details:", error);
            toast.error("Failed to load adoption details");
        } finally {
        }
    }, [adoptionId]);

    useEffect(() => {
        if (!adoptionId) {
            router.push("/adoptions");
            return;
        }
        fetchAdoptionDetail();
    }, [adoptionId]);

    useEffect(() => {
        if (refreshTicket > 0 && adoptionId) {
            fetchAdoptionDetail();
        }
    }, [refreshTicket]);

    return (
        <>
            <div className="w-full flex flex-col items-center justify-start gap-4 bg-[#E8F5E9] min-h-screen pb-10">
                <AdoptionHeader stage={adoption?.stage_tag.name} petName={adoption?.pet.name}/>
                <SubmittedCollapsible currentUser={session?.user} adoption={adoption} />

                <MeetNGreetCollapsible currentUser={session?.user} adoption={adoption}/>
                <ReviewedCollapsible currentUser={session?.user} adoption={adoption}/>
                <HandoverCollapsible currentUser={session?.user} adoption={adoption}/>
            </div>
        </>
    );
}
