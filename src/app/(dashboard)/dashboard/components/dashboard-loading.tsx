import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/dupui/table";
import { Skeleton } from "@/shared/components/dupui/skeleton";

export function DashboardLoading() {
  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Search/filter skeleton */}
      <Skeleton className="h-4 w-48 shrink-0" />
      
      <div className="flex-1 overflow-hidden">
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {/* Checkbox column */}
                <TableHead className="w-12">
                  <Skeleton className="h-4 w-4" />
                </TableHead>
                {/* Avatar column */}
                <TableHead className="w-10">
                  <Skeleton className="h-4 w-12" />
                </TableHead>
                {/* Title column */}
                <TableHead className="min-w-0">
                  <Skeleton className="h-4 w-16" />
                </TableHead>
                {/* Language column */}
                <TableHead>
                  <Skeleton className="h-4 w-20" />
                </TableHead>
                {/* Status column */}
                <TableHead>
                  <Skeleton className="h-4 w-16" />
                </TableHead>
                {/* Views column */}
                <TableHead>
                  <Skeleton className="h-4 w-12" />
                </TableHead>
                {/* Created column */}
                <TableHead>
                  <Skeleton className="h-4 w-16" />
                </TableHead>
                {/* Actions column */}
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i} className="h-16">
                  {/* Checkbox */}
                  <TableCell>
                    <Skeleton className="h-4 w-4" />
                  </TableCell>
                  
                  {/* Avatar */}
                  <TableCell>
                    <Skeleton className="h-6 w-6 rounded-full" />
                  </TableCell>
                  
                  {/* Title column - complex with multiple elements */}
                  <TableCell className="min-w-0 max-w-xs">
                    <div className="space-y-2">
                      {/* Title */}
                      <Skeleton className="h-4 w-32" />
                      {/* Description */}
                      <Skeleton className="h-3 w-24" />
                      {/* Slug with icon */}
                      <div className="flex items-center gap-1">
                        <Skeleton className="h-3 w-3" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                      {/* Tags */}
                      <div className="flex gap-1">
                        <Skeleton className="h-4 w-12 rounded-full" />
                        <Skeleton className="h-4 w-16 rounded-full" />
                      </div>
                    </div>
                  </TableCell>
                  
                  {/* Language badge */}
                  <TableCell>
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </TableCell>
                  
                  {/* Status badges */}
                  <TableCell>
                    <div className="flex gap-1">
                      <Skeleton className="h-5 w-12 rounded-full" />
                      <Skeleton className="h-5 w-10 rounded-full" />
                    </div>
                  </TableCell>
                  
                  {/* Views */}
                  <TableCell>
                    <Skeleton className="h-4 w-8" />
                  </TableCell>
                  
                  {/* Created date */}
                  <TableCell>
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  
                  {/* Actions dropdown */}
                  <TableCell>
                    <Skeleton className="h-8 w-8 rounded" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}