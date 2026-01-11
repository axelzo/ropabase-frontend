import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteClothingItem } from "@/lib/api";
import { CLOTHING_QUERY_KEY } from "./useClothingItems";
import { toast } from "sonner";

export function useDeleteClothingItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteClothingItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLOTHING_QUERY_KEY });
      toast.success("Item deleted successfully!");
    },
    onError: (error) => {
      console.error("Failed to delete item", error);
      toast.error("Failed to delete item. Please try again.");
    },
  });
}
