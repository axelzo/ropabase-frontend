import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateClothingItem } from "@/lib/api";
import { CLOTHING_QUERY_KEY } from "./useClothingItems";

export function useUpdateClothingItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      updateClothingItem(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLOTHING_QUERY_KEY });
    },
    onError: (error) => {
      console.error("Failed to update item", error);
      alert("Failed to update item. Please try again.");
    },
  });
}
