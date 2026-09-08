import * as React from 'react'
import {
  columnFilteringFeature,
  createPaginatedRowModel,
  createFilteredRowModel,
  createSortedRowModel,
  flexRender,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
  type ColumnDef,
  type RowData,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronLeft, ChevronRight, ChevronsUpDown, ChevronUp } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/state'
import { cn } from '@/utils'

const features = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  rowSortingFeature,
  rowPaginationFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
})

type TableFeaturesType = typeof features

export type AppColumnDef<TData extends RowData, TValue = unknown> = ColumnDef<
  TableFeaturesType,
  TData,
  TValue
>

interface DataTableProps<TData extends RowData> {
  columns: AppColumnDef<TData>[]
  data: TData[]
  loading?: boolean
  pageSize?: number
  emptyTitle?: string
  toolbar?: React.ReactNode
}

export function DataTable<TData extends RowData>({
  columns,
  data,
  loading,
  pageSize = 10,
  emptyTitle = 'No matching records',
  toolbar,
}: DataTableProps<TData>) {
  const table = useTable(
    { features, data, columns, initialState: { pagination: { pageIndex: 0, pageSize } } },
    (state) => ({ pagination: state.pagination, sorting: state.sorting }),
  )

  const pagination = table.state?.pagination ?? { pageIndex: 0, pageSize }
  const pageIndex = pagination?.pageIndex ?? 0

  return (
    <div className="space-y-4">
      {toolbar}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-[0_1px_3px_rgba(61,25,42,0.04)]">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort()
                  const sorted = header.column.getIsSorted()
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : (
                        <button
                          type="button"
                          disabled={!canSort}
                          onClick={header.column.getToggleSortingHandler()}
                          className={cn(
                            'inline-flex w-full items-center gap-1.5 disabled:pointer-events-none disabled:opacity-50',
                            canSort && 'cursor-pointer hover:text-foreground',
                          )}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {canSort &&
                            (sorted === 'asc' ? (
                              <ChevronUp className="size-3.5 text-primary" />
                            ) : sorted === 'desc' ? (
                              <ChevronDown className="size-3.5 text-primary" />
                            ) : (
                              <ChevronsUpDown className="size-3.5 opacity-40" />
                            ))}
                        </button>
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: Math.min(6, pageSize) }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-full max-w-40" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-48 p-0">
                  <EmptyState title={emptyTitle} description="Try adjusting your search or filters." />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{table.getRowModel().rows.length}</span> of{' '}
          <span className="font-medium text-foreground">{table.getFilteredRowModel().rows.length}</span> records
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2.5"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
          >
            <ChevronLeft className="size-3.5" />
            Prev
          </Button>
          <span className="min-w-16 text-center text-sm text-muted-foreground">
            Page {pageIndex + 1} of {Math.max(1, table.getPageCount())}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2.5"
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
          >
            Next
            <ChevronRight className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}