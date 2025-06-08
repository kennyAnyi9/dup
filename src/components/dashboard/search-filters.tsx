"use client";

import { useState, useTransition } from "react";
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
  Loader2
} from "lucide-react";

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
  
  const [search, setSearch] = useState(defaultSearch);
  const [filter, setFilter] = useState(defaultFilter);
  const [sort, setSort] = useState(defaultSort);

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
    <div className="space-y-4">
      {/* Search and Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by title or content..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-10"
            />
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
            <SelectTrigger className="w-[140px]">
              <div className="flex items-center gap-2">
                {getFilterIcon(filter)}
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center gap-2">
                  <Filter className="h-3 w-3" />
                  All Pastes
                </div>
              </SelectItem>
              <SelectItem value="public">
                <div className="flex items-center gap-2">
                  <Globe className="h-3 w-3" />
                  Public
                </div>
              </SelectItem>
              <SelectItem value="unlisted">
                <div className="flex items-center gap-2">
                  <EyeOff className="h-3 w-3" />
                  Unlisted
                </div>
              </SelectItem>
              <SelectItem value="private">
                <div className="flex items-center gap-2">
                  <Lock className="h-3 w-3" />
                  Private
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Sort Dropdown */}
          <Select value={sort} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[120px]">
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
          <span className="text-sm text-muted-foreground">Active filters:</span>
          
          {search && (
            <Badge variant="secondary" className="gap-1">
              Search: "{search}"
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
            Clear all
          </Button>
        </div>
      )}

      {/* Loading indicator */}
      {isPending && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          Updating results...
        </div>
      )}
    </div>
  );
}