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
import {Icon} from "@iconify/react";

export default function AdoptionDetailPage() {
    const params = useParams();
    const adoptionId = params.id as string;
    const router = useRouter();
    const [adoption, setAdoption] = useState<Adoption | null>(null);
    const { data: session, status } = useSession();
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

    const isPartyDeactivated = !!adoption && (adoption.provider?.is_active === false || adoption.adopter?.is_active === false);
    const isAdopter = session?.user?.role.name === "adopter";

    return (
        <>
            <div className="w-full flex flex-col items-center justify-start gap-4 sm:gap-6 bg-[#E8F5E9] min-h-screen px-4 sm:px-6 pt-4 sm:pt-6 pb-10">
                <AdoptionHeader stage={adoption?.stage_tag.name} petName={adoption?.pet.name}/>
                
                {isPartyDeactivated && (
                    <div className="w-full max-w-4xl px-4 py-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl flex items-center gap-3 shadow-sm">
                        <Icon icon="ph:warning-circle" className="w-5 h-5 shrink-0 text-amber-600" />
                        <div className="text-sm font-medium text-left">
                            Notice: One of the users involved in this adoption has deactivated their account. Further progress and interactions are disabled.
                        </div>
                    </div>
                )}

                {status !== "loading" && (
                    isAdopter ?
                        <div className="w-full max-w-4xl px-4 py-2.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl flex items-center gap-3 shadow-sm">
                            <Icon icon="ph:warning-circle" className="w-4 h-4 shrink-0 text-amber-600" />
                            <div className="text-xs font-medium text-left">
                                <strong>Notice:</strong> Adoption is 100% free (Rp0). If the provider asks for money, please use the <strong>Report</strong> button.
                            </div>
                        </div>
                        :
                        <div className="w-full max-w-4xl px-4 py-2.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl flex items-center gap-3 shadow-sm">
                            <Icon icon="ph:warning-circle" className="w-4 h-4 shrink-0 text-amber-600" />
                            <div className="text-xs font-medium text-left">
                                <strong>Notice:</strong> Commercial trading is strictly prohibited. If this adopter violates adoption terms or behaves inappropriately, please use the <strong>Report</strong> button.
                            </div>
                        </div>
                )}

                <SubmittedCollapsible currentUser={session?.user} adoption={adoption} isPartyDeactivated={isPartyDeactivated} />

                <MeetNGreetCollapsible currentUser={session?.user} adoption={adoption} isPartyDeactivated={isPartyDeactivated} />
                <ReviewedCollapsible currentUser={session?.user} adoption={adoption} isPartyDeactivated={isPartyDeactivated} />
                <HandoverCollapsible currentUser={session?.user} adoption={adoption} isPartyDeactivated={isPartyDeactivated} />
            </div>
        </>
    );
}
