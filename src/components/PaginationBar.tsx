"use client";

import { useSearchParams } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export default function PaginationBar({
  currentPage,
  totalPages,
}: PaginationProps) {
  // * creates readonly URL search params obj
  const searchParams = useSearchParams();

  function getLink(page: number) {
    // * must create new obj that allows setting func
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("page", page.toString());

    return `?${newSearchParams.toString()}`;
  }

  if (totalPages <= 1) {
    return null;
  }

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          {/* // * inside pagination comps, <Link> from next/link can use relative search params, also uses button variants like 'ghost' for disabled styling */}
          <PaginationPrevious
            href={getLink(currentPage - 1)}
            className={cn(
              currentPage === 1 && "pointer-events-none text-muted-foreground",
            )}
          />
        </PaginationItem>
        {/* TODO how does this work? */}
        {Array.from({ length: totalPages }).map((_, i) => {
          const page = i + 1;
          const isEdgePage = page === 1 || page === totalPages;
          // ? checks if two or more/less places away?
          const isNearCurrentPage = Math.abs(page - currentPage) <= 2;

          if (!isEdgePage && !isNearCurrentPage) {
            // * not edges but second inner edges
            if (i === 1 || i === totalPages - 2) {
              return (
                <PaginationItem key={page} className="hidden md:block">
                  <PaginationEllipsis className="text-muted-foreground" />
                </PaginationItem>
              );
            }
            return null;
          }

          return (
            <PaginationItem
              key={page}
              className={cn(
                "hidden md:block",
                page === currentPage && "pointer-events-none block",
              )}
            >
              <PaginationLink
                href={getLink(page)}
                isActive={page === currentPage}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          );
        })}
        <PaginationItem>
          <PaginationNext
            href={getLink(currentPage + 1)}
            className={cn(
              currentPage >= totalPages &&
                "pointer-events-none text-muted-foreground",
            )}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
