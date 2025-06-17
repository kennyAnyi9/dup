"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  X, 
  SortAsc, 
  Globe, 
  Lock, 
  EyeOff,
  Loader
} from "lucide-react";
import { useKeyboardShortcuts, isMac } from "@/hooks/use-keyboard-shortcuts";

interface SearchFiltersProps {
  defaultSearch?: string;
  defaultFilter?: string;
  defaultSort?: string;
}

export function SearchFilters({ 
  defaultSearch = "", 
  defaultFilter = "all", 
  defaultSort = "newest" 
}: SearchFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const [search, setSearch] = useState(defaultSearch);
  const [filter, setFilter] = useState(defaultFilter);
  const [sort, setSort] = useState(defaultSort);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'k',
      metaKey: isMac(),
      ctrlKey: !isMac(),
      callback: () => {
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      },
      description: 'Focus search'
    }
  ]);

  function updateFilters(newSearch?: string, newFilter?: string, newSort?: string) {
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
    
    // Reset to page 1 when filters change
    params.delete("page");
    
    const queryString = params.toString();
    const url = queryString ? `${pathname}?${queryString}` : pathname;
    
    startTransition(() => {
      router.push(url);
    });
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateFilters(search.trim());
  }

  function handleFilterChange(newFilter: string) {
    setFilter(newFilter);
    updateFilters(undefined, newFilter);
  }

  function handleSortChange(newSort: string) {
    setSort(newSort);
    updateFilters(undefined, undefined, newSort);
  }

  function clearSearch() {
    setSearch("");
    updateFilters("");
  }

  function clearAllFilters() {
    setSearch("");
    setFilter("all");
    setSort("newest");
    updateFilters("", "all", "newest");
  }

  const hasActiveFilters = search || filter !== "all" || sort !== "newest";

  function getFilterIcon(filterValue: string) {
    switch (filterValue) {
      case "public":
        return <Globe className="h-3 w-3" />;
      case "private":
        return <Lock className="h-3 w-3" />;
      case "unlisted":
        return <EyeOff className="h-3 w-3" />;
      default:
        return <Filter className="h-3 w-3" />;
    }
  }

  function getFilterLabel(filterValue: string) {
    switch (filterValue) {
      case "public":
        return "Public";
      case "private":
        return "Private";
      case "unlisted":
        return "Unlisted";
      default:
        return "All Pastes";
    }
  }

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Search and Quick Actions */}
      <div className="flex flex-col gap-3">
        <form onSubmit={handleSearchSubmit} className="w-full">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              placeholder="Search pastes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-24 h-9 md:h-10"
            />
            {!search && (
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted border-border px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                <span className="text-xs">{isMac() ? '⌘' : 'Ctrl'}</span>
                <span>K</span>
              </kbd>
            )}
            {search && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </form>

        <div className="flex gap-2">
          {/* Filter Dropdown */}
          <Select value={filter} onValueChange={handleFilterChange}>
            <SelectTrigger className="flex-1 h-9 md:h-10 md:flex-initial md:w-[130px]">
              <div className="flex items-center gap-2">
                {getFilterIcon(filter)}
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Pastes</SelectItem>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="unlisted">Unlisted</SelectItem>
              <SelectItem value="private">Private</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort Dropdown */}
          <Select value={sort} onValueChange={handleSortChange}>
            <SelectTrigger className="flex-1 h-9 md:h-10 md:flex-initial md:w-[110px]">
              <div className="flex items-center gap-2">
                <SortAsc className="h-3 w-3" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="views">Most Viewed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs md:text-sm text-muted-foreground">Active filters:</span>
          
          {search && (
            <Badge variant="secondary" className="gap-1">
              Search: &quot;{search}&quot;
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="h-auto p-0.5 hover:bg-transparent"
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          )}
          
          {filter !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {getFilterIcon(filter)}
              {getFilterLabel(filter)}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFilterChange("all")}
                className="h-auto p-0.5 hover:bg-transparent"
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          )}
          
          {sort !== "newest" && (
            <Badge variant="secondary" className="gap-1">
              <SortAsc className="h-2 w-2" />
              {sort === "oldest" ? "Oldest" : "Most Viewed"}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSortChange("newest")}
                className="h-auto p-0.5 hover:bg-transparent"
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-6 px-2 text-xs"
          >
            <span className="hidden sm:inline">Clear all</span>
            <span className="sm:hidden">Clear</span>
          </Button>
        </div>
      )}

      {/* Loading indicator */}
      {isPending && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader className="h-3 w-3 animate-spin" />
          Updating results...
        </div>
      )}
    </div>
  );
}