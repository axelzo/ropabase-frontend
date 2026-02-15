"use client";

import { useState, useCallback, useMemo } from "react";
import { ClothingFilters } from "@/lib/api";
import { useDebounce } from "@/hooks/useDebounce";

const INITIAL_FILTERS: ClothingFilters = {
  category: "",
  brand: "",
  color: "",
  name: "",
};

export function useClothingFilters() {
  const [filters, setFilters] = useState<ClothingFilters>(INITIAL_FILTERS);

  // Debounce text fields (name, brand) for API queries
  const debouncedName = useDebounce(filters.name, 300);
  const debouncedBrand = useDebounce(filters.brand, 300);

  // Combine debounced text fields with instant discrete fields
  const debouncedFilters = useMemo<ClothingFilters>(
    () => ({
      ...filters,
      name: debouncedName,
      brand: debouncedBrand,
    }),
    [filters, debouncedName, debouncedBrand]
  );

  const updateFilter = useCallback(
    <K extends keyof ClothingFilters>(key: K, value: ClothingFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const removeFilter = useCallback((key: keyof ClothingFilters) => {
    setFilters((prev) => ({ ...prev, [key]: "" }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
  }, []);

  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some((v) => v !== "" && v !== undefined);
  }, [filters]);

  // Count of category/color/brand (excludes search name)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category) count++;
    if (filters.color) count++;
    if (filters.brand) count++;
    return count;
  }, [filters.category, filters.color, filters.brand]);

  return {
    filters,
    debouncedFilters,
    updateFilter,
    clearFilters,
    removeFilter,
    hasActiveFilters,
    activeFilterCount,
  };
}
