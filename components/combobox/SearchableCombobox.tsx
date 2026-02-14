"use client"

import * as React from "react"
import {Check, ChevronsUpDown, Loader2} from "lucide-react"
import {cn} from "@/lib/utils"
import {Button} from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface ComboboxOption {
    id: string
    name: string
}

interface SearchableComboboxProps {
    options: ComboboxOption[]
    selectedValues: string[]
    onSelect: (value: string) => void
    onSearch?: (search: string) => void
    onLoadMore?: () => void
    isLoading?: boolean
    hasMore?: boolean
    placeholder?: string
    emptyMessage?: string
    mode?: "single" | "multiple"
}

export function SearchableCombobox({
                                       options,
                                       selectedValues,
                                       onSelect,
                                       onSearch,
                                       onLoadMore,
                                       isLoading = false,
                                       hasMore = false,
                                       placeholder = "Select...",
                                       emptyMessage = "No options found.",
                                       mode = "multiple",
                                   }: SearchableComboboxProps) {
    const [open, setOpen] = React.useState(false)
    const [searchValue, setSearchValue] = React.useState("")

    const availableOptions = React.useMemo(() => {
        if (mode === "single") return options
        return options.filter(option => !selectedValues.includes(option.id))
    }, [options, selectedValues, mode])

    const handleScroll = React.useCallback((e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget
        const {scrollTop, scrollHeight, clientHeight} = target
        const scrollPercentage = (scrollTop + clientHeight) / scrollHeight

        if (scrollPercentage > 0.9 && hasMore && !isLoading && onLoadMore) {
            onLoadMore()
        }
    }, [hasMore, isLoading, onLoadMore])

    const timeoutRef = React.useRef<NodeJS.Timeout | null>(null)
    const handleSearch = React.useCallback(
        (value: string) => {
            setSearchValue(value)

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }

            timeoutRef.current = setTimeout(() => {
                onSearch?.(value)
            }, 300)
        },
        [onSearch]
    )

    // Cleanup on unmount
    React.useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [])

    const displayValue = React.useMemo(() => {
        if (mode === "single" && selectedValues.length > 0) {
            const selected = options.find(opt => opt.id === selectedValues[0])
            return selected?.name || placeholder
        }
        return placeholder
    }, [mode, selectedValues, options, placeholder])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between font-normal"
                >
                    {displayValue}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Search..."
                        value={searchValue}
                        onValueChange={handleSearch}
                    />
                    <CommandList onScroll={handleScroll}>
                        <CommandEmpty>{emptyMessage}</CommandEmpty>
                        <CommandGroup>
                            {availableOptions.map((option) => (
                                <CommandItem
                                    key={option.id}
                                    value={option.id}
                                    onSelect={() => {
                                        onSelect(option.id)
                                        if (mode === "single") {
                                            setOpen(false)
                                        }
                                        setSearchValue("")
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            selectedValues.includes(option.id) ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {option.name}
                                </CommandItem>
                            ))}

                            {isLoading && (
                                <div className="flex items-center justify-center py-3">
                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground"/>
                                    <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
                                </div>
                            )}

                            {!isLoading && !hasMore && availableOptions.length > 0 && (
                                <div className="py-2 text-center text-xs text-muted-foreground">
                                    No more options
                                </div>
                            )}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}