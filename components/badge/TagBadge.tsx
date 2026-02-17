import {Badge} from "@/components/ui/badge"
import {Icon} from "@iconify/react"
import {cn} from "@/lib/utils"

interface TagBadgeProps {
    label: string
    onRemove?: () => void
    disabled?: boolean
}

export const TagBadge = ({label, onRemove, disabled = false}: TagBadgeProps) => (
    <Badge
        variant="secondary"
        className={cn(
            "bg-[#E7F3E7] text-[#4CAF50] px-3 py-1.5 rounded-xl flex gap-2 items-center font-medium text-sm border-0 transition-colors",
            !disabled && "hover:bg-[#D7E8D7]",
            disabled && "opacity-50 cursor-not-allowed"
        )}
    >
        {label}
        {onRemove && !disabled && (
            <button
                type="button"
                onClick={(e) => {
                    e.preventDefault()
                    onRemove()
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
)