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
  // Hitung total halaman
  const totalPages = Math.max(1, Math.ceil(total / per_page));

  // Generate page numbers for display (simple logic, can be improved for large pages)
  const pageNumbers = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
  } else {
    if (current_page <= 4) {
      pageNumbers.push(1, 2, 3, 4, 5, 'ellipsis-1', totalPages - 1, totalPages);
    } else if (current_page >= totalPages - 3) {
      pageNumbers.push(1, 2, 'ellipsis-1', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pageNumbers.push(1, 'ellipsis-1', current_page - 1, current_page, current_page + 1, 'ellipsis-2', totalPages);
    }
  }

  // Calculate showing range
  const start = (current_page - 1) * per_page + 1;
  const end = Math.min(current_page * per_page, total);

  return (
    <div className="w-full flex justify-center">
      <div className="pagination-bar-container flex items-center gap-1 md:gap-2 lg:gap-6 max-w-fit w-full text-xs md:text-sm lg:text-base">
        <Field orientation="horizontal" className="w-fit">
          <FieldLabel htmlFor="select-rows-per-page" className="text-xs md:text-sm lg:text-base whitespace-nowrap">Rows per page</FieldLabel>
          <Select
            defaultValue={per_page.toString()}
            onValueChange={v => onRowsPerPageChange && onRowsPerPageChange(Number(v))}
          >
            <SelectTrigger className="w-12 md:w-20 lg:w-28 h-6 md:h-8 lg:h-10 text-xs md:text-sm lg:text-base px-1 md:px-2 lg:px-4" id="select-rows-per-page">
              <SelectValue className="text-xs md:text-sm lg:text-base" />
            </SelectTrigger>
            <SelectContent align="start" className="text-xs md:text-sm lg:text-base">
              <SelectGroup>
                {rowsPerPageOptions.map(opt => (
                  <SelectItem key={opt} value={opt.toString()} className="text-xs md:text-sm lg:text-base px-1 md:px-2 lg:px-4 py-1 md:py-2 lg:py-3 h-6 md:h-8 lg:h-10">
                    {opt}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        <Pagination className="mx-2 w-auto text-xs md:text-sm lg:text-base">
          <PaginationContent className="gap-x-4 md:gap-x-6 lg:gap-x-8">
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={e => {
                  e.preventDefault();
                  if (onPageChange && current_page > 1) onPageChange(current_page - 1);
                }}
                aria-disabled={current_page === 1}
                className={cn(
                  'h-6 md:h-8 lg:h-10 w-6 md:w-8 lg:w-10 flex items-center justify-center rounded px-0 md:px-2 lg:px-4 text-xs md:text-sm lg:text-base',
                  current_page === 1 && 'pointer-events-none opacity-50'
                )}
              />
            </PaginationItem>
            {pageNumbers.map((num) =>
              typeof num === 'string' && num.startsWith('ellipsis') ? (
                <PaginationItem key={num} className="min-w-0 p-0 h-6 md:h-8 lg:h-10">
                  <PaginationEllipsis className="h-4 md:h-6 lg:h-8 w-4 md:w-6 lg:w-8" />
                </PaginationItem>
              ) : (
                <PaginationItem key={num} className="min-w-0 p-0 h-6 md:h-8 lg:h-10">
                  <PaginationLink
                    href="#"
                    isActive={num === current_page}
                    className={
                      (num === current_page ? 'bg-black text-white ' : '') +
                      'h-6 md:h-8 lg:h-10 w-6 md:w-8 lg:w-10 px-0 md:px-2 lg:px-4 text-xs md:text-sm lg:text-base min-w-0'
                    }
                    onClick={e => {
                      e.preventDefault();
                      if (onPageChange && num !== current_page) onPageChange(Number(num));
                    }}
                  >
                    {num}
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
                  'h-6 md:h-8 lg:h-10 w-6 md:w-8 lg:w-10 flex items-center justify-center rounded px-0 md:px-2 lg:px-4 text-xs md:text-sm lg:text-base'
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
        <div className="text-xs md:text-sm lg:text-base text-muted-foreground text-right whitespace-nowrap">
          Showing <span className="font-bold">{start}</span> to <span className="font-bold">{end}</span> of <span className="font-bold">{total}</span>
        </div>
      </div>
    </div>
  );
}
