import React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Column<T> {
  key: string;
  header: string;
  cell: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  searchQuery?: string;
  searchPlaceholder?: string;
  totalPages?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  handleSearch?: (query: string) => void;
  loading?: boolean;
  shimmerRowsCount?: number;
}

interface SearchBarProps {
  query: string;
  placeholder: string;
  onChange: (value: string) => void;
}

interface PaginationControlsProps {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const ShimmerRows = ({
  columns,
  count = 5,
}: {
  columns: Column<unknown>[];
  count?: number;
}) => (
  <>
    {Array.from({ length: count }).map((_, rowIdx) => (
      <TableRow key={`shimmer-${rowIdx}`}>
        {columns.map((_, colIdx) => (
          <TableCell key={`shimmer-${rowIdx}-${colIdx}`}>
            <Skeleton className="h-4 w-full" />
          </TableCell>
        ))}
      </TableRow>
    ))}
  </>
);

const SearchBar: React.FC<SearchBarProps> = ({
  query,
  placeholder,
  onChange,
}) => (
  <div className="relative">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    <Input
      placeholder={placeholder}
      value={query}
      onChange={(e) => onChange(e.target.value)}
      className="pl-10"
    />
  </div>
);

const PaginationControls: React.FC<PaginationControlsProps> = ({
  totalPages,
  currentPage,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const handlePrev = () => onPageChange(Math.max(currentPage - 1, 1));
  const handleNext = () => onPageChange(Math.min(currentPage + 1, totalPages));

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 2;

    pages.push(1);

    if (currentPage > maxVisible) {
      pages.push("...");
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - (maxVisible - 1)) {
      pages.push("...");
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={handlePrev}
            className={
              currentPage === 1
                ? "pointer-events-none opacity-50"
                : "cursor-pointer"
            }
          />
        </PaginationItem>

        {pages.map((page, idx) =>
          page === "..." ? (
            <PaginationItem key={`ellipsis-${idx}`}>
              <span className="px-2">...</span>
            </PaginationItem>
          ) : (
            <PaginationItem key={page}>
              <PaginationLink
                isActive={page === currentPage}
                onClick={() => onPageChange(page as number)}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          )
        )}

        <PaginationItem>
          <PaginationNext
            onClick={handleNext}
            className={
              currentPage === totalPages
                ? "pointer-events-none opacity-50"
                : "cursor-pointer"
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export const DataTable = <T,>({
  data,
  columns,
  searchable = false,
  searchPlaceholder = "Search...",
  searchQuery = "",
  handleSearch = () => {},
  totalPages = 1,
  currentPage = 1,
  onPageChange = () => {},
  loading = false,
  shimmerRowsCount = 10,
}: DataTableProps<T>) => {
  const renderedHeaders = columns.map((column) => (
    <TableHead
      key={column.key}
      className={column.sortable ? "cursor-pointer select-none" : ""}
    >
      <div className="flex items-center space-x-1">
        <p>{column.header}</p>
      </div>
    </TableHead>
  ));

  const renderedRows = loading ? (
    <ShimmerRows columns={columns} count={shimmerRowsCount} />
  ) : data.length > 0 ? (
    data.map((item, index) => (
      <TableRow
        key={index}
        className="hover:bg-muted/50 transition-all duration-200 hover:translate-y-[-2px] hover:shadow-sm"
      >
        {columns.map((column) => (
          <TableCell key={`${index}-${column.key}`}>
            {column.cell(item)}
          </TableCell>
        ))}
      </TableRow>
    ))
  ) : (
    <TableRow>
      <TableCell colSpan={columns.length} className="text-center py-8">
        No data available
      </TableCell>
    </TableRow>
  );

  return (
    <div className="flex flex-col h-full space-y-4">
      {searchable && (
        <div className="shrink-0">
          <SearchBar
            query={searchQuery}
            placeholder={searchPlaceholder}
            onChange={handleSearch}
          />
        </div>
      )}

      <div className="flex-1 rounded-md border border-border overflow-auto min-h-0">
        <Table>
          <TableHeader>
            <TableRow>{renderedHeaders}</TableRow>
          </TableHeader>
          <TableBody>{renderedRows}</TableBody>
        </Table>
      </div>

      <div className="shrink-0 mt-auto">
        <PaginationControls
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
};
