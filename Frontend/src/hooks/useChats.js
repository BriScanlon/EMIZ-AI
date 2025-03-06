import { useQuery } from "@tanstack/react-query";
import { getChats as getChatsApi } from "../services/api";
import { toast } from "react-hot-toast";

export function useChats() {
  const {
    data: { chats } = {},
    isLoading,
    isError,
    error,
    refetch, // Add refetch to the return object
  } = useQuery({
    queryKey: ["chats"],
    queryFn: () => getChatsApi(),
    onError: (err) => {
      toast.error(err.message || "Failed to load chats.");
    },
  });

  return { chats, isLoading, isError, error, refetch }; // Return refetch
}
