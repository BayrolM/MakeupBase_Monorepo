import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}: PaginationProps) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="mt-6 flex flex-col items-center gap-3">
      {/* Page navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1.5 text-foreground hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-foreground transition-colors"
          style={{ fontSize: '14px' }}
        >
          <ChevronLeft className="w-4 h-4 inline mr-1" />
          Anterior
        </button>

        <div className="flex items-center gap-1.5">
          <span className="text-foreground-secondary mx-1" style={{ fontSize: '14px' }}>|</span>
          {getPageNumbers().map((page, index) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 text-foreground-secondary"
                  style={{ fontSize: '14px' }}
                >
                  ...
                </span>
              );
            }

            return (
              <button
                key={page}
                onClick={() => onPageChange(page as number)}
                className={`min-w-[32px] px-2.5 py-1 rounded transition-all ${
                  currentPage === page
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:text-primary hover:bg-primary/10'
                }`}
                style={{ fontSize: '14px' }}
              >
                {page}
              </button>
            );
          })}
          <span className="text-foreground-secondary mx-1" style={{ fontSize: '14px' }}>|</span>
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 text-foreground hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-foreground transition-colors"
          style={{ fontSize: '14px' }}
        >
          Siguiente
          <ChevronRight className="w-4 h-4 inline ml-1" />
        </button>
      </div>

      {/* Info text */}
      <span className="text-foreground-secondary" style={{ fontSize: '13px' }}>
        Mostrando {startItem}–{endItem} de {totalItems} registros
      </span>
    </div>
  );
}
