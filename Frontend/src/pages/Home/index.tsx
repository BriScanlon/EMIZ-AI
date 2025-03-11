// styles
import { mapClassesCurried } from '@blocdigital/useclasslist';
import maps from './index.module.scss';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import ChatThinking from '../../components/ChatThinking';
import ChatInput from '../../components/ChatInput';
const mc = mapClassesCurried(maps, true);

const cannedQueries = [
  'Tell me a joke',
  "What's the weather like today?",
  'How do you make a cake?',
  'What is the capital of France?',
  'Can you explain quantum mechanics?',
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
    try {
      const response = await fetch(`http://127.0.0.1:8085/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_name: query.slice(0, 12), query, debug_test: false, verbose: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to send query');
      }

      const { chat_name } = await response.json();

      navigate(`/conversation/${chat_name}`);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={mc('conversation__main')}>
      <div className={mc('conversation__container')}>
        <div className={mc('conversation__canned-queries')}>
          {cannedQueries.map((query) => (
            <button
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
