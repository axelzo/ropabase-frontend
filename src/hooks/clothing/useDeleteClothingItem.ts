import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteClothingItem } from "@/lib/api";
import { CLOTHING_QUERY_KEY } from "./useClothingItems";

export function useDeleteClothingItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteClothingItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLOTHING_QUERY_KEY });
    },
    onError: (error) => {
      console.error("Failed to delete item", error);
      alert("Failed to delete item. Please try again.");
    },
  });
}
