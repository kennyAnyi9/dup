import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/dupui/table";

export function DashboardLoading() {
  return (
    <div className="flex flex-col h-full space-y-3">
      <div className="h-4 bg-muted animate-pulse rounded w-48 shrink-0" />
      <div className="flex-1 overflow-hidden">
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-8">
                  <div className="h-4 w-4 bg-muted animate-pulse rounded" />
                </TableHead>
                <TableHead>
                  <div className="h-4 bg-muted animate-pulse rounded w-20" />
                </TableHead>
                <TableHead>
                  <div className="h-4 bg-muted animate-pulse rounded w-16" />
                </TableHead>
                <TableHead>
                  <div className="h-4 bg-muted animate-pulse rounded w-12" />
                </TableHead>
                <TableHead>
                  <div className="h-4 bg-muted animate-pulse rounded w-12" />
                </TableHead>
                <TableHead>
                  <div className="h-4 bg-muted animate-pulse rounded w-16" />
                </TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="h-4 w-4 bg-muted animate-pulse rounded" />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="h-4 bg-muted animate-pulse rounded w-32" />
                      <div className="h-3 bg-muted animate-pulse rounded w-20" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="h-5 w-16 bg-muted animate-pulse rounded" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-muted animate-pulse rounded w-16" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-muted animate-pulse rounded w-8" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-muted animate-pulse rounded w-12" />
                  </TableCell>
                  <TableCell>
                    <div className="h-8 w-8 bg-muted animate-pulse rounded" />
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