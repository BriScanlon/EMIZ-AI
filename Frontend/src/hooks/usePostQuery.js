import { useMutation } from "@tanstack/react-query";
import { postQuery as postQueryApi } from "../services/api";
import { toast } from "react-hot-toast";

export function usePostQuery() {
  const {
    mutate: postQuery,
    isLoading,
    isError,
    error,
  } = useMutation({
    mutationFn: postQueryApi,
    onError: (err) => {
      toast.error(err.message || "Failed to post query.");
    },
  });

  return { postQuery, isLoading, isError, error };
}
