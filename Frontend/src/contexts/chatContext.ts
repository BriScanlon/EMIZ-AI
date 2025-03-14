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
  
      window.scrollTo({ top: 0, behavior: "smooth" });
  
      try {
        // Always include chat_name since this is an existing conversation
        const requestBody = {
          chat_name: conversationId,
          query,
          debug_test: false,
          verbose: false,
        };
  
        console.log("🚀 Sending API Request...");
        console.log("📨 Query Payload:", requestBody);
  
        const response = await fetch(`http://127.0.0.1:8085/query`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });
  
        console.log("🔍 API Response Status:", response.status);
  
        if (!response.ok) {
          console.error("❌ API Error - Response was not OK:", response);
          const { message } = await response.json();
          throw new Error(message || "Failed to fetch");
        }
  
        const data = await response.json();
        console.log("📦 API Response Data:", data);
  
        const newChatMessage = {
          timestamp: new Date().toISOString(),
          query: data.query,
          results: data.results,
        };
  
        window.scrollTo({ top: 0, behavior: "smooth" });
        setConversationHistory((prevChatHistory) => [newChatMessage, ...(prevChatHistory || [])]);
      } catch (error) {
        console.error("🚨 API Request Failed:", error);
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [conversationId]
  );
  

  useEffect(() => {
    const fetchChatHistory = async () => {
      console.log(`📡 Fetching chat history for conversation: ${conversationId}...`);
      setLoading(true);
    
      try {
        const response = await fetch(`http://127.0.0.1:8085/chat_history/${conversationId}`);
        console.log("🔍 API Response Status:", response.status);
    
        if (!response.ok) {
          console.error("❌ API Error - Failed to fetch chat history.");
          const { message } = await response.json();
          throw new Error(message || "Failed to fetch chat history.");
        }
    
        const data = await response.json();
        console.log("📦 Received Chat History Data:", data);
    
        setConversationHistory(data.chat_history);
      } catch (error) {
        console.error("🚨 Error fetching chat history:", error);
        setError((error as Error).message);
      } finally {
        console.log("✅ Chat history fetch completed.");
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
