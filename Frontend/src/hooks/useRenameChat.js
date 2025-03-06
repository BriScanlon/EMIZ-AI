import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { renameChatApi } from "../services/api";

export function useRenameChat() {
  const mutation = useMutation({
    mutationFn: ({ chatName, newChatName }) =>
      renameChatApi(chatName, newChatName),
    onSuccess: () => {
      toast.success("Chat renamed successfully.");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to rename chat.");
    },
  });

  return mutation;
}
