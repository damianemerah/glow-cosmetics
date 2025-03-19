import type React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";

interface DataTableProps<T> {
  columns: {
    key: string;
    title: string;
    render?: (row: T) => React.ReactNode;
  }[];
  data: T[];
  emptyState?: React.ReactNode;
}

export default function DataTable<T>({
  columns,
  data,
  emptyState,
}: DataTableProps<T>) {
  return (
    <div className="w-full overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className="text-primary font-medium"
                >
                  {column.title}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {emptyState || "No results found."}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, i) => (
                <TableRow key={i}>
                  {columns.map((column) => (
                    <TableCell key={`${i}-${column.key}`}>
                      {column.render
                        ? column.render(row)
                        : (row as any)[column.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {data.length === 0 ? (
          <Card>
            <CardContent className="text-center py-6">
              {emptyState || "No results found."}
            </CardContent>
          </Card>
        ) : (
          data.map((row, i) => (
            <Card key={i}>
              <CardContent className="py-4">
                {columns.map((column) => (
                  <div
                    key={column.key}
                    className="flex justify-between py-2 border-b last:border-b-0"
                  >
                    <span className="font-medium">{column.title}</span>
                    <span>
                      {column.render
                        ? column.render(row)
                        : (row as any)[column.key]}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
