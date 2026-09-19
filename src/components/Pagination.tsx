import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const PAGE_SIZE = 20;

/** Client-side paging over an already filtered/sorted list. `resetKey` should
 * change whenever the search/filter changes so the user lands back on page 1. */
export function usePagination<T>(items: T[], resetKey: string = '', pageSize: number = PAGE_SIZE) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  useEffect(() => {
    setPage(1);
  }, [resetKey]);

  // A delete/void can shrink the list under the current page.
  const safePage = Math.min(page, totalPages);
  const pageItems = items.slice((safePage - 1) * pageSize, safePage * pageSize);

  return { pageItems, page: safePage, setPage, totalPages, total: items.length, pageSize };
}

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize?: number;
  onChange: (page: number) => void;
  variant?: 'dark' | 'light';
}

export const Pagination: React.FC<PaginationProps> = ({ page, totalPages, total, pageSize = PAGE_SIZE, onChange, variant = 'dark' }) => {
  if (total <= pageSize) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const dark = variant === 'dark';
  const btn = dark
    ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200 disabled:opacity-40'
    : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700 disabled:opacity-40';

  return (
    <div className={`flex items-center justify-between gap-3 pt-3 text-xs ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
      <span>Showing {from}–{to} of {total}</span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          className={`px-2.5 py-1.5 rounded-lg border font-bold flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed ${btn}`}
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Prev
        </button>
        <span className="font-bold">Page {page} of {totalPages}</span>
        <button
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
          className={`px-2.5 py-1.5 rounded-lg border font-bold flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed ${btn}`}
        >
          Next <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
