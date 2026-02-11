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
  onRowsPerPageChange?: (rows: number) => void;
  rowsPerPageOptions?: number[];
}
export function PaginationBar({
  current_page,
  total,
  per_page,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [10, 25, 50, 100],
}: PaginationBarProps) {
  // Ensure there is always at least 1 page (even when total is 0) so the pagination UI remains consistent
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
        <div className="w-full flex items-center justify-center">
            <div className="w-fit border-t border-gray-200 bg-white rounded-lg">
                <div
                    className="max-w-1/2 flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 sm:px-6">
                    {/* Rows per page selector */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-700 whitespace-nowrap">Rows per page:</span>
                        <Select
                            value={per_page.toString()}
                            onValueChange={v => onRowsPerPageChange && onRowsPerPageChange(Number(v))}
                        >
                            <SelectTrigger className="w-20 h-9 text-sm">
                                <SelectValue/>
                            </SelectTrigger>
                            <SelectContent align="start">
                                <SelectGroup>
                                    {rowsPerPageOptions.map(opt => (
                                        <SelectItem key={opt} value={opt.toString()}>
                                            {opt}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Page navigation */}
                    <Pagination className="w-auto">
                        <PaginationContent className="gap-1">
                            <PaginationItem>
                                <PaginationPrevious
                                    href="#"
                                    onClick={e => {
                                        e.preventDefault();
                                        if (onPageChange && current_page > 1) onPageChange(current_page - 1);
                                    }}
                                    aria-disabled={current_page === 1}
                                    className={cn(
                                        'h-9 px-3 text-sm',
                                        current_page === 1 && 'pointer-events-none opacity-50'
                                    )}
                                />
                            </PaginationItem>

                            {pageNumbers.map((item) =>
                                typeof item === 'object' ? (
                                    <PaginationItem key={item.key}>
                                        <PaginationEllipsis className="h-9 w-9"/>
                                    </PaginationItem>
                                ) : (
                                    <PaginationItem key={item}>
                                        <PaginationLink
                                            href="#"
                                            isActive={item === current_page}
                                            className={cn(
                                                'h-9 w-9 text-sm',
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
                                        'h-9 px-3 text-sm',
                                        current_page === totalPages && 'pointer-events-none opacity-50'
                                    )}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>

                    {/* Showing info */}
                    <div className="text-sm text-gray-700 whitespace-nowrap">
                        Showing <span className="font-semibold">{start}</span> to{' '}
                        <span className="font-semibold">{end}</span> of{' '}
                        <span className="font-semibold">{total}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}