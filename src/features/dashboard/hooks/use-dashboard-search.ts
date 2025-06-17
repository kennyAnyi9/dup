"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function useDashboardSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateSearch = useCallback(
    (params: Record<string, string | null>) => {
      const newSearchParams = new URLSearchParams(searchParams);
      
      Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === "") {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, value);
        }
      });
      
      // Always reset to page 1 when search changes
      if ("search" in params || "filter" in params || "sort" in params) {
        newSearchParams.delete("page");
      }
      
      router.push(`?${newSearchParams.toString()}`);
    },
    [router, searchParams]
  );

  const updateSingleParam = useCallback(
    (key: string, value: string | null) => {
      updateSearch({ [key]: value });
    },
    [updateSearch]
  );

  return {
    updateSearch,
    updateSingleParam,
    currentParams: Object.fromEntries(searchParams.entries()),
  };
}