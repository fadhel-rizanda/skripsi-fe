import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type PageItem = number | { type: 'ellipsis'; key: string };

interface PaginationBarProps {
    current_page: number;
    total: number;
    per_page: number;
    onPageChange?: (page: number) => void;
    onDataPerPageChange?: (jumlah: number) => void;
    dataPerPageOptions?: number[];
}

export function PaginationBar({
    current_page,
    total,
    per_page,
    onPageChange,
    onDataPerPageChange,
    dataPerPageOptions = [10, 25, 50, 100],
}: PaginationBarProps) {
    // Gunakan per_page sebagai jumlah data per halaman
    const totalPages = Math.max(1, Math.ceil(total / per_page));

    // Generate page numbers for display
    const pageNumbers: PageItem[] = [];
    if (totalPages <= 5) {
        for (let i = 1; i <= totalPages; i++) {
            pageNumbers.push(i);
        }
    } else {
        pageNumbers.push(1);
        if (current_page <= 3) {
            pageNumbers.push(2, 3);
            pageNumbers.push({type: 'ellipsis', key: 'ellipsis-end'});
            pageNumbers.push(totalPages);
        } else if (current_page >= totalPages - 2) {
            pageNumbers.push({type: 'ellipsis', key: 'ellipsis-start'});
            pageNumbers.push(totalPages - 2, totalPages - 1, totalPages);
        } else {
            pageNumbers.push({type: 'ellipsis', key: 'ellipsis-start'});
            pageNumbers.push(current_page);
            pageNumbers.push({type: 'ellipsis', key: 'ellipsis-end'});
            pageNumbers.push(totalPages);
        }
    }

    // Calculate showing range
    const start = total > 0 ? (current_page - 1) * per_page + 1 : 0;
    const end = Math.min(current_page * per_page, total);

    return (
        <div className="w-full px-3 sm:px-0">
            <div className="w-full border-t border-gray-200 bg-white rounded-lg">
                <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 px-4 py-3 sm:px-6">
                    {/* Data per page selector */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm text-gray-700 whitespace-nowrap">Data per page:</span>
                        <Select
                            value={per_page.toString()}
                            onValueChange={v => onDataPerPageChange && onDataPerPageChange(Number(v))}
                        >
                            <SelectTrigger className="w-16 h-8 sm:w-20 sm:h-9 text-xs sm:text-sm">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent align="start">
                                <SelectGroup>
                                    {dataPerPageOptions.map(opt => (
                                        <SelectItem key={opt} value={opt.toString()}>
                                            {opt}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Page navigation (center) */}
                    <div className="flex-1 flex items-center justify-center overflow-x-auto scrollbar-hide">
                        <Pagination className="inline-flex">
                            <PaginationContent className="flex items-center gap-1">
                                <PaginationItem>
                                    <PaginationPrevious
                                        href="#"
                                        onClick={e => {
                                            e.preventDefault();
                                            if (onPageChange && current_page > 1) onPageChange(current_page - 1);
                                        }}
                                        aria-disabled={current_page === 1}
                                        className={cn(
                                            'h-8 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm',
                                            current_page === 1 && 'pointer-events-none opacity-50'
                                        )}
                                    />
                                </PaginationItem>

                                {pageNumbers.map(item =>
                                    typeof item === 'object' ? (
                                        <PaginationItem key={item.key}>
                                            <PaginationEllipsis className="h-8 w-8 sm:h-9 sm:w-9" />
                                        </PaginationItem>
                                    ) : (
                                        <PaginationItem key={item}>
                                            <PaginationLink
                                                href="#"
                                                isActive={item === current_page}
                                                className={cn(
                                                    'h-8 w-8 sm:h-9 sm:w-9 text-xs sm:text-sm',
                                                    item === current_page && 'bg-black text-white hover:bg-black hover:text-white'
                                                )}
                                                onClick={e => {
                                                    e.preventDefault();
                                                    if (onPageChange && item !== current_page) onPageChange(item);
                                                }}
                                            >
                                                {item}
                                            </PaginationLink>
                                        </PaginationItem>
                                    )
                                )}

                                <PaginationItem>
                                    <PaginationNext
                                        href="#"
                                        onClick={e => {
                                            e.preventDefault();
                                            if (onPageChange && current_page < totalPages) onPageChange(current_page + 1);
                                        }}
                                        aria-disabled={current_page === totalPages}
                                        className={cn(
                                            'h-8 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm',
                                            current_page === totalPages && 'pointer-events-none opacity-50'
                                        )}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>

                    {/* Showing info */}
                    <div className="ml-3 text-xs sm:text-sm text-gray-700 whitespace-nowrap">
                        Showing <span className="font-semibold">{start}</span> to{' '}
                        <span className="font-semibold">{end}</span> of{' '}
                        <span className="font-semibold">{total}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}