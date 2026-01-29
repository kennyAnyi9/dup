"use client";

import { useTransition, createContext, useContext, useState, useRef, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/shared/components/dupui/button";
import { Input } from "@/shared/components/dupui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/dupui/select";
import { cn } from "@/shared/lib/utils";
import { Globe, Lock, EyeOff, Layers, Search, X, ArrowUpDown, CalendarDays, Clock, Calendar, Eye, Sparkles } from "lucide-react";

// Create a context to share loading state
export const FilterLoadingContext = createContext<boolean>(false);

export function useFilterLoading() {
  return useContext(FilterLoadingContext);
}

interface SearchFiltersProps {
  defaultSearch?: string;
  defaultFilter?: string;
  defaultSort?: string;
  children?: React.ReactNode;
}

export function SearchFilters({
  defaultSearch = "",
  defaultFilter = "all",
  defaultSort = "newest",
  children,
}: SearchFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(defaultSearch);
  const [sort, setSort] = useState(defaultSort);

  const debounceTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const previousSearchRef = useRef(defaultSearch);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const updateParams = useCallback((newSearch?: string, newFilter?: string, newSort?: string) => {
    const params = new URLSearchParams(searchParams);

    // Update search
    if (newSearch !== undefined) {
      if (newSearch) {
        params.set("search", newSearch);
      } else {
        params.delete("search");
      }
    }

    // Update filter
    if (newFilter !== undefined) {
      if (newFilter && newFilter !== "all") {
        params.set("filter", newFilter);
      } else {
        params.delete("filter");
      }
    }

    // Update sort
    if (newSort !== undefined) {
      if (newSort && newSort !== "newest") {
        params.set("sort", newSort);
      } else {
        params.delete("sort");
      }
    }

    // Reset to page 1 when params change
    params.delete("page");

    const queryString = params.toString();
    const url = queryString ? `${pathname}?${queryString}` : pathname;

    startTransition(() => {
      router.push(url);
    });
  }, [searchParams, pathname, router]);

  const handleFilterChange = (newFilter: string) => {
    updateParams(undefined, newFilter);
  };

  const handleSortChange = (newSort: string) => {
    setSort(newSort);
    updateParams(undefined, undefined, newSort);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearch(newValue);

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      if (newValue.trim() !== previousSearchRef.current) {
        previousSearchRef.current = newValue.trim();
        updateParams(newValue.trim());
      }
    }, 400);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    updateParams(search.trim());
  };

  const clearSearch = () => {
    setSearch("");
    updateParams("");
  };

  const filters = [
    { value: "public", label: "Public", icon: Globe, iconColor: "text-blue-300" },
    { value: "private", label: "Private", icon: Lock, iconColor: "text-red-300" },
    { value: "unlisted", label: "Unlisted", icon: EyeOff, iconColor: "text-amber-300" },
    { value: "all", label: "All", icon: null, iconColor: null },
  ];

  const sortOptions = [
    { value: "newest", label: "Newest", icon: Clock },
    { value: "oldest", label: "Oldest", icon: Calendar },
    { value: "views", label: "Most Viewed", icon: Eye },
    { value: "relevance", label: "Relevance", icon: Sparkles },
  ];

  const currentSortOption = sortOptions.find(option => option.value === sort) || sortOptions[0];
  const SortIcon = currentSortOption.icon;

  return (
    <FilterLoadingContext.Provider value={isPending}>
      <div className="flex flex-col gap-3">
        {/* Top row: Filter tabs, Sort dropdown, and Search */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Filter tabs */}
          <div className="flex items-center gap-1 border border-border rounded-2xl p-1 w-fit font-inter bg-accent">
            {filters.map((filter) => {
              const Icon = filter.icon;
              return (
                <Button
                  key={filter.value}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFilterChange(filter.value)}
                  className={cn(
                    "h-8 px-4 rounded-[0.7rem] text-sm font-inter",
                    Icon && "gap-1.5",
                    defaultFilter === filter.value && "bg-background"
                  )}
                  disabled={isPending}
                >
                  {Icon && <Icon className={cn("h-3.5 w-3.5", filter.iconColor)} />}
                  {filter.label}
                </Button>
              );
            })}
          </div>

          {/* Sort Dropdown */}
          <Select value={sort} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[200px] h-[42px] py-5 font-commit-mono font-medium rounded-2xl">
              <div className="flex items-center gap-2">
                <SortIcon className="h-3.5 w-3.5" />
                <span>{currentSortOption.label}</span>
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-2xl w-[200px]">
              {sortOptions.map((option) => {
                const OptionIcon = option.icon;
                return (
                  <SelectItem key={option.value} value={option.value} className="rounded-xl font-commit-mono font-medium text-sm">
                    <div className="flex items-center gap-2">
                      <OptionIcon className="h-3.5 w-3.5" />
                      {option.label}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search pastes..."
                value={search}
                onChange={handleSearchChange}
                className="pl-9 pr-8 h-[42px] font-inter text-sm rounded-2xl"
              />
              {search && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </form>
        </div>

        {children}
      </div>
    </FilterLoadingContext.Provider>
  );
}