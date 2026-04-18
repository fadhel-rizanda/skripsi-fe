import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {Adoption} from "@/types/adoption";
import {UserProfile} from "@/types";
import ChatButton from "@/components/button/ChatButton";
import {useRouter} from "next/navigation";
import AdoptionTerminateButton from "@/components/button/AdoptionTerminateButton";

export default function SubmittedCollapsible({
                                                 adoption,
                                                 currentUser,
                                             }: {
    adoption?: Adoption | null;
    currentUser?: UserProfile | null;
}) {
    const router = useRouter();
    const date = adoption?.created_at
        ? new Date(adoption.created_at).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        })
        : "N/A";

    const time = adoption?.created_at
        ? new Date(adoption.created_at).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        })
        : "N/A";

    const isAdopter = currentUser?.role.name === "adopter";
    const role = isAdopter ? "Provider" : "Adopter";
    const otherUserId = isAdopter
        ? adoption?.provider.id
        : adoption?.adopter?.id;

    const isActive =
        adoption?.stage_tag.name.toLowerCase() !== "completed" &&
        adoption?.stage_tag.name.toLowerCase() !== "rejected";

    if (!adoption) {
        return (
        <div className="w-full max-w-4xl border rounded-xl sm:rounded-2xl px-3 sm:px-4 py-3 sm:py-4 bg-white animate-pulse">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-slate-200"/>
                <div className="h-4 w-28 sm:w-32 bg-slate-200 rounded"/>
            </div>
            <div className="h-3 w-3/4 bg-slate-100 rounded mb-4 sm:mb-6"/>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 border-t border-slate-50 pt-3 sm:pt-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="space-y-1.5 sm:space-y-2">
                        <div className="h-2 w-16 bg-slate-100 rounded"/>
                        <div className="h-3 w-24 bg-slate-200 rounded"/>
                    </div>
                ))}
            </div>
        </div>
        );
    }

    return (
        <Accordion
            type="single"
            collapsible
            defaultValue="item-1"
            className="w-full max-w-4xl border rounded-xl sm:rounded-2xl px-3 sm:px-4 bg-white"
        >
            <AccordionItem value="item-1" className="border-none">
                <AccordionTrigger className="hover:no-underline py-2.5 sm:py-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-[#19E619] shrink-0"/>
                        <span className="text-sm sm:text-base font-bold text-slate-900 text-left">
                            Application Submitted
                        </span>
                    </div>
                </AccordionTrigger>

                <AccordionContent className="pt-0 pb-3 sm:pb-4 text-xs sm:text-sm">
                    <p className="text-slate-500 mb-3 sm:mb-4">
                        We have received your application. Thank you for your
                        interest in adopting!
                    </p>

                    <div className="border-t border-slate-100 pt-3 sm:pt-4">
                        <h3 className="font-bold text-xs sm:text-sm mb-2.5 sm:mb-3 text-slate-900">
                            Application Details
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-2.5 sm:gap-y-3 gap-x-4">
                            <DetailItem label="Application ID" value={adoption?.id}/>
                            <DetailItem label="Submission Date" value={date}/>
                            <DetailItem label="Submission Time" value={time}/>
                            <DetailItem
                                label="Animal Name"
                                value={adoption.pet?.name || "Unknown Pet"}
                                directUrl={`/pets/${adoption.pet?.id}`}
                            />
                            <DetailItem
                                label="Applicant Name"
                                value={adoption.adopter?.name || "Unknown Adopter"}
                                directUrl={`/profile/${adoption.adopter?.id}`}
                            />
                            <DetailItem
                                label="Provider Name"
                                value={adoption.provider.name || "Unknown Provider"}
                                directUrl={`/profile/${adoption.provider.id}`}
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                        {
                            isActive &&
                            (
                                <AdoptionTerminateButton
                                    adoption={adoption}
                                    currentUser={currentUser}
                                    onSuccess={() => router.push("/adoptions")}
                                />
                            )
                        }

                        {otherUserId && (
                            <ChatButton
                                targetUserId={otherUserId}
                                label={`Chat ${role}`}
                            />
                        )}
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    )
        ;
}

function DetailItem({ label, value, directUrl }: { label: string; value: string; directUrl?: string }) {
    const router = useRouter();

    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-[10px] sm:text-xs font-bold text-slate-900">{label}:</span>
            <span
                className={`text-xs sm:text-sm text-slate-600 max-w-fit truncate ${directUrl ? "cursor-pointer hover:text-blue-500 hover:underline" : ""}`}
                onClick={() => {
                    if (directUrl) {
                        router.push(directUrl);
                    }
                }}
            >
                {value}
            </span>
        </div>
    );
}