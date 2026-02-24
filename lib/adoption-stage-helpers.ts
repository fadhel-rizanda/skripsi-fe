import {Adoption} from "@/types/adoption";

const STAGE_ORDER = [
    "Submitted",
    "Requirement",
    "Meet & Greet",
    "Handover",
    "Completed",
] as const;

export type StageName = typeof STAGE_ORDER[number];

type StageState = "done" | "active" | "inactive";

export function getStageState(adoption: Adoption | null | undefined, targetStage: StageName): StageState {
    if (!adoption?.stage_tag?.name) return "inactive";

    const currentIndex = STAGE_ORDER.indexOf(adoption.stage_tag.name as StageName);
    const targetIndex = STAGE_ORDER.indexOf(targetStage);

    if (currentIndex < 0 || targetIndex < 0) return "inactive";

    if (currentIndex > targetIndex) return "done";
    if (currentIndex === targetIndex) return "active";
    return "inactive";
}

export function getDotColor(state: StageState): string {
    switch (state) {
        case "done":     return "bg-green-500";
        case "active":   return "bg-yellow-400";
        case "inactive": return "bg-slate-300";
    }
}

export function getHeaderBadge(
    state: StageState,
    adoption: Adoption | null | undefined
): { label: string; className: string } | null {
    if (state === "inactive") return null;

    if (state === "done") {
        return {
            label: "Completed",
            className: "bg-emerald-50 text-emerald-700 border-emerald-200",
        };
    }

    return {
        label: adoption?.status?.name ?? "Need an Action",
        className: adoption?.status?.color_code ?? "bg-orange-50 text-orange-700 border-orange-200",
    };
}
