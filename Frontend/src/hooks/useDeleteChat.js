import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { deleteChatApi } from "../services/api";

export function useDeleteChat() {
  const mutation = useMutation({
    mutationFn: (chatName) => deleteChatApi(chatName),
    onSuccess: () => {
      toast.success("Chat deleted successfully.");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete chat.");
    },
  });

  return mutation;
}
