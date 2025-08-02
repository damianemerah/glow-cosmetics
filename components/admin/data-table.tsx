"use client";

import type React from "react";
import {
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  ToggleGroup,
  ToggleGroupItem,
} from "@/constants/ui/index";
import { Table as TableIcon, List as ListIcon } from "lucide-react"; // Import icons
import { useState } from "react"; // Import useState

interface DataTableProps<T> {
  columns: {
    key: string;
    title: string;
    render?: (row: T) => React.ReactNode;
    header?: () => React.ReactNode;
  }[];
  data: T[];
  emptyState?: React.ReactNode;
  isLoading?: boolean;
  loadingState?: React.ReactNode;
  allowToggleView?: boolean; // New prop to control view toggling
}

export default function DataTable<T>({
  columns,
  data,
  emptyState,
  isLoading,
  loadingState,
  allowToggleView = false, // Default to false
}: DataTableProps<T>) {
  const [viewMode, setViewMode] = useState<"table" | "single">("table");

  // Show loading state if specified
  if (isLoading && loadingState) {
    return loadingState;
  }

  return (
    <div className="w-full overflow-hidden">
      {allowToggleView && (
        <div className="flex justify-end mb-4">
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(value: "table" | "single") => {
              if (value) {
                setViewMode(value);
              }
            }}
            className="flex" // Only show on desktop for now
          >
            <ToggleGroupItem value="table" aria-label="Toggle table view">
              <TableIcon className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="single" aria-label="Toggle single view">
              <ListIcon className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      )}
      {/* Desktop Table View */}
      {viewMode === "table" ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    className="text-primary font-medium"
                  >
                    {column.header ? column.header() : column.title}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* eslint-disable @typescript-eslint/no-explicit-any */}
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
              {/* eslint-enable @typescript-eslint/no-explicit-any */}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div>
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
                  {/* eslint-disable @typescript-eslint/no-explicit-any */}
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
                  {/* eslint-enable @typescript-eslint/no-explicit-any */}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
