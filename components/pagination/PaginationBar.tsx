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
        <div className="pagination-bar-container flex items-center gap-2 max-w-fit w-full">
        <Field orientation="horizontal" className="w-fit">
        <FieldLabel htmlFor="select-rows-per-page">Rows per page</FieldLabel>
        <Select
          defaultValue={per_page.toString()}
          onValueChange={v => onRowsPerPageChange && onRowsPerPageChange(Number(v))}>
          <SelectTrigger className="w-20" id="select-rows-per-page">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="start">
            <SelectGroup>
              {rowsPerPageOptions.map(opt => (
                <SelectItem key={opt} value={opt.toString()}>{opt}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>
        <Pagination className="mx-0 w-auto">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={e => {
                e.preventDefault();
                if (onPageChange && current_page > 1) onPageChange(current_page - 1);
              }}
              aria-disabled={current_page === 1}
              className={current_page === 1 ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
          {pageNumbers.map((num) =>
            typeof num === 'string' && num.startsWith('ellipsis') ? (
              <PaginationItem key={num}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={num}>
                <PaginationLink
                  href="#"
                  isActive={num === current_page}
                  className={num === current_page ? 'bg-black text-white' : ''}
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
              className={current_page === totalPages ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
        <div className="text-sm text-muted-foreground text-right">
        Showing <span className="font-bold">{start}</span> to <span className="font-bold">{end}</span> of <span className="font-bold">{total}</span>
      </div>
      </div>
    </div>
  );
}
