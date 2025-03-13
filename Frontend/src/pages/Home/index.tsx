// styles
import { mapClassesCurried } from '@blocdigital/useclasslist';
import maps from './index.module.scss';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import ChatThinking from '../../components/ChatThinking';
import ChatInput from '../../components/ChatInput';
const mc = mapClassesCurried(maps, true);

const cannedQueries = [
  'Help me design a maintainance schedule please.',
  "What information is needed to calculate ongoing running costs of a vehicle?",
  'I am new, suggest some orientation tasks please.',
];

export default function Home() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleQuery = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { query } = Object.fromEntries(new FormData(event.currentTarget));
    await performQueryRequest((query as string).trim());
  };

  const performQueryRequest = async (query: string) => {
    setLoading(true);
  
    console.log("🚀 Sending API Request...");
    console.log("📨 Query Payload:", {
      query,
      debug_test: false,
      verbose: true,
    });
  
    try {
      const response = await fetch(`http://127.0.0.1:8085/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          debug_test: false,
          verbose: true,
        }),
      });
  
      console.log("🔍 API Response Status:", response.status);
  
      if (!response.ok) {
        console.error("❌ API Error - Response was not OK:", response);
        throw new Error(`Failed to send query: ${response.statusText}`);
      }
  
      const jsonResponse = await response.json();
      console.log("📦 API Response Data:", jsonResponse);
  
      navigate(`/conversation/${jsonResponse.chat_name}`);
    } catch (error) {
      console.error("🚨 API Request Failed:", error);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className={mc('conversation__main')}>
      <div className={mc('conversation__container')}>
        <div className={mc('conversation__canned-queries')}>
          {cannedQueries.map((query, index) => (
            <button
              key={index} // ✅ This ensures each button has a unique key
              className={mc('conversation__canned-query')}
              onClick={() => performQueryRequest(query)}
              disabled={loading}
            >
              {query}
            </button>
          ))}
        </div>
        {loading && <ChatThinking thinking="Thinking..." />}
        <ChatInput handleQuery={handleQuery} loading={loading} />
      </div>
    </div>
  );
}
