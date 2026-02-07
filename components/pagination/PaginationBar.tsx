import { Field, FieldLabel } from "@/components/ui/field";
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

  // Generate page numbers for display (simple logic, can be improved for large pages)
  const pageNumbers: PageItem[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
  } else {
    if (current_page <= 4) {
      pageNumbers.push(1, 2, 3, 4, 5, { type: 'ellipsis', key: 'ellipsis-1' }, totalPages - 1, totalPages);
    } else if (current_page >= totalPages - 3) {
      pageNumbers.push(1, 2, { type: 'ellipsis', key: 'ellipsis-1' }, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pageNumbers.push(1, { type: 'ellipsis', key: 'ellipsis-1' }, current_page - 1, current_page, current_page + 1, { type: 'ellipsis', key: 'ellipsis-2' }, totalPages);
    }
  }

  // Calculate showing range
  const start = (current_page - 1) * per_page + 1;
  const end = Math.min(current_page * per_page, total);

  return (
    <div className="w-full flex justify-center">
      <div className="pagination-bar-container flex items-center gap-1 sm:gap-1.5 md:gap-2 lg:gap-6 max-w-fit w-full text-xs sm:text-xs md:text-sm lg:text-base">
        <Field orientation="horizontal" className="w-fit">
          <FieldLabel htmlFor="select-rows-per-page" className="text-xs sm:text-xs md:text-sm lg:text-base whitespace-nowrap">Rows per page</FieldLabel>
          <Select
            defaultValue={per_page.toString()}
            onValueChange={v => onRowsPerPageChange && onRowsPerPageChange(Number(v))}
          >
            <SelectTrigger className="w-12 sm:w-16 md:w-20 lg:w-28 h-6 sm:h-7 md:h-8 lg:h-9 text-xs sm:text-xs md:text-sm lg:text-base px-1 sm:px-1.5 md:px-2 lg:px-4" id="select-rows-per-page">
              <SelectValue className="text-xs sm:text-xs md:text-sm lg:text-base" />
            </SelectTrigger>
            <SelectContent align="start" className="text-xs sm:text-xs md:text-sm lg:text-base">
              <SelectGroup>
                {rowsPerPageOptions.map(opt => (
                  <SelectItem key={opt} value={opt.toString()} className="text-xs sm:text-xs md:text-sm lg:text-base px-1 sm:px-1.5 md:px-2 lg:px-4 py-1 sm:py-1.5 md:py-2 lg:py-2 h-6 sm:h-7 md:h-8 lg:h-9">
                    {opt}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        <Pagination className="mx-2 w-auto text-xs sm:text-xs md:text-sm lg:text-base">
          <PaginationContent className="gap-x-4 sm:gap-x-5 md:gap-x-6 lg:gap-x-8">
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={e => {
                  e.preventDefault();
                  if (onPageChange && current_page > 1) onPageChange(current_page - 1);
                }}
                aria-disabled={current_page === 1}
                className={cn(
                  'h-6 sm:h-7 md:h-8 lg:h-9 w-6 sm:w-7 md:w-8 lg:w-9 flex items-center justify-center rounded px-0 sm:px-1 md:px-2 lg:px-4 text-xs sm:text-xs md:text-sm lg:text-base',
                  current_page === 1 && 'pointer-events-none opacity-50'
                )}
              />
            </PaginationItem>
            {pageNumbers.map((item) =>
              typeof item === 'object' ? (
                <PaginationItem key={item.key} className="min-w-0 p-0 h-6 sm:h-7 md:h-8 lg:h-9">
                  <PaginationEllipsis className="h-4 sm:h-5 md:h-6 lg:h-7 w-4 sm:w-5 md:w-6 lg:w-7" />
                </PaginationItem>
              ) : (
                <PaginationItem key={item} className="min-w-0 p-0 h-6 sm:h-7 md:h-8 lg:h-9">
                  <PaginationLink
                    href="#"
                    isActive={item === current_page}
                    className={
                      (item === current_page ? 'bg-black text-white ' : '') +
                      'h-6 sm:h-7 md:h-8 lg:h-9 w-6 sm:w-7 md:w-8 lg:w-9 px-0 sm:px-1 md:px-2 lg:px-4 text-xs sm:text-xs md:text-sm lg:text-base min-w-0'
                    }
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
                className={
                  (current_page === totalPages ? 'pointer-events-none opacity-50 ' : '') +
                  'h-6 sm:h-7 md:h-8 lg:h-9 w-6 sm:w-7 md:w-8 lg:w-9 flex items-center justify-center rounded px-0 sm:px-1 md:px-2 lg:px-4 text-xs sm:text-xs md:text-sm lg:text-base'
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
        <div className="text-xs sm:text-xs md:text-sm lg:text-base text-muted-foreground text-right whitespace-nowrap">
          Showing <span className="font-bold">{start}</span> to <span className="font-bold">{end}</span> of <span className="font-bold">{total}</span>
        </div>
      </div>
    </div>
  );
}
