import { createContext, useCallback, useEffect, useMemo, useState } from 'react';

export interface GraphResponse {
  nodes: { id: number; name: string; category: number }[];
  links: { source: number; target: number }[];
  categories: { id: number; name: string }[];
}

interface ChatMessage {
  timestamp: string;
  query: string;
  results: { message: string; graph: GraphResponse }[];
}

interface IUseChat {
  conversationHistory: ChatMessage[] | undefined;
  Loading: boolean;
  handleQuery: (event: React.FormEvent<HTMLFormElement>) => void;
  error: string | null;
  latestQuery: string | null;
}

export default function useChat({ conversationId }: { conversationId: string }): IUseChat {
  const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>();
  const [Loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latestQuery, setLatestQuery] = useState<string | null>(null);

  const handleQuery = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const { query } = Object.fromEntries(new FormData(event.currentTarget));

      setLatestQuery(query as string);
      setLoading(true);

      window.scrollTo({ top: 0, behavior: 'smooth' });

      try {
        const response = await fetch(`http://127.0.0.1:8085/query`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_name: conversationId, query, debug_test: false, verbose: false }),
        });

        if (!response.ok) {
          const { message } = await response.json();
          throw new Error(message || 'Failed to fetch');
        }

        const data = await response.json();

        const newChatMessage = {
          timestamp: new Date().toISOString(),
          query: data.query,
          results: data.results,
        };
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setConversationHistory((prevChatHistory) => [newChatMessage, ...(prevChatHistory || [])]);
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [conversationId],
  );

  useEffect(() => {
    const fetchChatHistory = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://127.0.0.1:8085/chat_history/${conversationId}`);

        if (!response.ok) {
          const { message } = await response.json();
          throw new Error(message || 'Failed to fetch');
        }

        const data = await response.json();
        setConversationHistory(data.chat_history);
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchChatHistory();
  }, [conversationId]);

  return useMemo(
    () => ({ conversationHistory, Loading, handleQuery, error, latestQuery }),
    [conversationHistory, Loading, handleQuery, error, latestQuery],
  );
}

export const ChatContext = createContext<IUseChat | undefined>(undefined);
