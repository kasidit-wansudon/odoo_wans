"use client";

import React, { ReactNode, useMemo, useState } from "react";

type Alignment = "left" | "center" | "right";

export type Column<T> = {
  key: string;
  label: string;
  align?: Alignment;
  render?: (row: T) => ReactNode;
  sortable?: boolean;
};

export type SortState = {
  key: string;
  direction: "asc" | "desc";
};

type SortableTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T) => string;
  defaultSort?: SortState;
  className?: string;
  onRowClick?: (row: T) => void;
};

export function SortableTable<T>({
  columns,
  data,
  rowKey,
  defaultSort,
  className,
  onRowClick,
}: SortableTableProps<T>) {
  const [sortState, setSortState] = useState<SortState | undefined>(defaultSort);

  const sortedData = useMemo(() => {
    if (!sortState) return data;
    const { key, direction } = sortState;
    return [...data].sort((a, b) => {
      const aValue = (a as Record<string, unknown>)[key];
      const bValue = (b as Record<string, unknown>)[key];
      if (aValue === bValue) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;
      if (typeof aValue === "number" && typeof bValue === "number") {
        return direction === "asc" ? aValue - bValue : bValue - aValue;
      }
      return direction === "asc"
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });
  }, [data, sortState]);

  const toggleSort = (key: string) => {
    setSortState((prev) => {
      if (!prev || prev.key !== key) {
        return { key, direction: "asc" };
      }
      if (prev.direction === "asc") {
        return { key, direction: "desc" };
      }
      return undefined;
    });
  };

  return (
    <table className={`w-full text-sm text-left ${className ?? ""}`}>
      <thead>
        <tr className="text-ink/60">
          {columns.map((col) => {
            const align = col.align ?? "left";
            const isSorted = sortState?.key === col.key;
            const icon = isSorted ? (sortState!.direction === "asc" ? "▲" : "▼") : "";
            const alignClass =
              align === "center" ? "text-center" : align === "right" ? "text-right" : "";
            return (
              <th key={String(col.key)} className={`pb-3 font-semibold ${alignClass}`}>
                {col.sortable ? (
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-ink/80 hover:text-ink"
                    onClick={() => toggleSort(col.key)}
                  >
                    <span>{col.label}</span>
                    <span className="text-xs">{icon}</span>
                  </button>
                ) : (
                  col.label
                )}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {sortedData.map((row) => (
          <tr
            key={rowKey(row)}
            className={`border-t border-ink/5 hover:bg-clay/30 transition ${
              onRowClick ? "cursor-pointer" : ""
            }`}
            onClick={() => onRowClick?.(row)}
          >
            {columns.map((col) => {
              const align = col.align ?? "left";
              const alignClass =
                align === "center" ? "text-center" : align === "right" ? "text-right" : "";
              const value = col.render ? col.render(row) : ((row as Record<string, unknown>)[col.key] as ReactNode);
              return (
                <td key={String(col.key)} className={`py-3 ${alignClass}`}>
                  {value}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
