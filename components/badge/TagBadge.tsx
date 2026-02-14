import {Badge} from "@/components/ui/badge";
import {Icon} from "@iconify/react";

export const TagBadge = ({label, onRemove}: { label: string; onRemove?: () => void }) => (
    <Badge
        variant="secondary"
        className="bg-[#E7F3E7] text-[#4CAF50] hover:bg-[#D7E8D7] px-3 py-1.5 rounded-xl flex gap-2 items-center font-medium text-sm border-0 transition-colors"
    >
        {label}
        {onRemove && (
            <button
                type="button"
                onClick={(e) => {
                    e.preventDefault();
                    onRemove();
                }}
                className="flex items-center justify-center"
            >
                <Icon
                    icon="ph:x-bold"
                    className="w-3.5 h-3.5 cursor-pointer hover:text-[#2D5A2F]"
                />
            </button>
        )}
    </Badge>
);