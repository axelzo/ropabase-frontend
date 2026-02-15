"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { ClothingFilters } from "@/lib/api";
import {
  CLOTHING_CATEGORIES,
  COMMON_COLORS,
  COLOR_HEX_MAP,
  formatCategory,
} from "@/lib/constants";

interface ClothingFilterBarProps {
  filters: ClothingFilters;
  onFilterChange: <K extends keyof ClothingFilters>(
    key: K,
    value: ClothingFilters[K]
  ) => void;
  onRemoveFilter: (key: keyof ClothingFilters) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  activeFilterCount: number;
}

export function ClothingFilterBar({
  filters,
  onFilterChange,
  onRemoveFilter,
  onClearFilters,
  hasActiveFilters,
  activeFilterCount,
}: ClothingFilterBarProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const activeChips: { key: keyof ClothingFilters; label: string }[] = [];
  if (filters.category) {
    activeChips.push({
      key: "category",
      label: formatCategory(filters.category),
    });
  }
  if (filters.color) {
    activeChips.push({ key: "color", label: filters.color });
  }
  if (filters.brand) {
    activeChips.push({ key: "brand", label: filters.brand });
  }

  return (
    <div className="mb-6 space-y-3">
      {/* Top bar: Search + Filter button */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search by name..."
            value={filters.name || ""}
            onChange={(e) => onFilterChange("name", e.target.value)}
            className="pl-9 h-10 bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700"
          />
          {filters.name && (
            <button
              onClick={() => onRemoveFilter("name")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 shrink-0 relative border-slate-300 dark:border-slate-700"
            >
              <SlidersHorizontal className="h-4 w-4" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <div className="mx-auto w-full max-w-lg px-4 pb-8">
              <DrawerHeader className="px-0">
                <DrawerTitle>Filters</DrawerTitle>
              </DrawerHeader>

              <div className="space-y-6">
                {/* Category pills */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                    Category
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {CLOTHING_CATEGORIES.map((cat) => {
                      const isSelected = filters.category === cat;
                      return (
                        <button
                          key={cat}
                          onClick={() =>
                            onFilterChange("category", isSelected ? "" : cat)
                          }
                          aria-pressed={isSelected}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            isSelected
                              ? "bg-blue-600 text-white"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                          }`}
                        >
                          {formatCategory(cat)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Color swatches */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                    Color
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {COMMON_COLORS.map((color) => {
                      const isSelected = filters.color === color;
                      const hex = COLOR_HEX_MAP[color];
                      const isLight =
                        color === "White" ||
                        color === "Beige" ||
                        color === "Yellow";
                      return (
                        <button
                          key={color}
                          onClick={() =>
                            onFilterChange("color", isSelected ? "" : color)
                          }
                          aria-label={color}
                          aria-pressed={isSelected}
                          className={`w-10 h-10 rounded-full transition-all ${
                            isSelected
                              ? "ring-2 ring-offset-2 ring-blue-600 dark:ring-offset-slate-950"
                              : ""
                          } ${isLight ? "border border-slate-300 dark:border-slate-600" : ""}`}
                          style={{ backgroundColor: hex }}
                          title={color}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Brand input */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                    Brand
                  </h3>
                  <Input
                    type="text"
                    placeholder="e.g., Levi's"
                    value={filters.brand || ""}
                    onChange={(e) => onFilterChange("brand", e.target.value)}
                    className="h-10 bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700"
                  />
                </div>

                {/* Clear all */}
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      onClearFilters();
                      setDrawerOpen(false);
                    }}
                    className="w-full h-10 gap-2 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                  >
                    <X className="h-4 w-4" />
                    Clear All Filters
                  </Button>
                )}
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      {/* Active filter chips */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeChips.map(({ key, label }) => (
            <Badge
              key={key}
              variant="secondary"
              className="gap-1 pl-3 pr-1.5 py-1 text-sm"
            >
              {label}
              <button
                onClick={() => onRemoveFilter(key)}
                aria-label={`Remove ${label} filter`}
                className="ml-1 rounded-full p-0.5 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
