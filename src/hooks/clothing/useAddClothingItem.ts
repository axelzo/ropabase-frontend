import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addClothingItem } from "@/lib/api";
import { CLOTHING_QUERY_KEY } from "./useClothingItems";

export function useAddClothingItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addClothingItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLOTHING_QUERY_KEY });
    },
    onError: (error) => {
      console.error("Failed to add item", error);
      alert("Failed to add item. Please try again.");
    },
  });
}
