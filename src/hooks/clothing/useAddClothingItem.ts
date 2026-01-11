import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addClothingItem } from "@/lib/api";
import { CLOTHING_QUERY_KEY } from "./useClothingItems";
import { toast } from "sonner";

export function useAddClothingItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addClothingItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLOTHING_QUERY_KEY });
      toast.success("Item added successfully!");
    },
    onError: (error) => {
      console.error("Failed to add item", error);
      toast.error("Failed to add item. Please try again.");
    },
  });
}
