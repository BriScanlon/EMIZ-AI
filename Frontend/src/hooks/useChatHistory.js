import { useQuery } from "@tanstack/react-query";
import { getChatHistory as getChatHistoryApi } from "../services/api";
import { toast } from "react-hot-toast";

export function useChatHistory(chatName) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["chatHistory", chatName], // Unique cache key per chat
    queryFn: () => getChatHistoryApi(chatName),
    enabled: !!chatName, // Only fetch when chatName is available
    onError: (err) => {
      toast.error(err.message || "Failed to load chat history.");
    },
  });

  return {
    query: data?.query || "",
    results: data?.results || [],
    isLoading,
    isError,
    error,
  };
}
