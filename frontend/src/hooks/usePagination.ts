import { useState, useMemo } from "react";

interface UsePaginationProps {
  initialPage?: number;
  initialLimit?: number;
  totalItems: number;
}

export function usePagination({
  initialPage = 1,
  initialLimit = 10,
  totalItems,
}: UsePaginationProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit);

  const totalPages = useMemo(() => {
    return Math.ceil(totalItems / itemsPerPage) || 1;
  }, [totalItems, itemsPerPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleLimitChange = (limit: number) => {
    setItemsPerPage(limit);
    setCurrentPage(1); // Reset a la primera página si cambia el límite
  };

  return {
    currentPage,
    itemsPerPage,
    totalPages,
    setCurrentPage,
    setItemsPerPage,
    handlePageChange,
    handleLimitChange,
  };
}
