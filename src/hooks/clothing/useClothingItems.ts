import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { getClothingItems, ClothingFilters } from "@/lib/api";

export const CLOTHING_QUERY_KEY = ["clothingItems"];

export const getClothingQueryKey = (filters?: ClothingFilters) =>
  ["clothingItems", filters ?? {}];

export function useClothingItems(filters?: ClothingFilters) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  return useQuery({
    queryKey: getClothingQueryKey(filters),
    queryFn: () => getClothingItems(filters),
    enabled: isAuthenticated && !authLoading,
  });
}
