import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { getClothingItems } from "@/lib/api";

export const CLOTHING_QUERY_KEY = ["clothingItems"];

export function useClothingItems() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  return useQuery({
    queryKey: CLOTHING_QUERY_KEY,
    queryFn: getClothingItems,
    enabled: isAuthenticated && !authLoading,
  });
}
