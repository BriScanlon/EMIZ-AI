import { useEffect, useState } from 'react';

import { Link, Outlet, useLocation } from 'react-router';

// styles
import useClassList, { mapClassesCurried } from '@blocdigital/useclasslist';
import maps from './ChatHistory.module.scss';
const mc = mapClassesCurried(maps, true);

export default function ChatHistory() {
  const classlist = useClassList({ defaultClass: 'chat-history', maps, string: true });

  const [previousConversations, setPreviousConversations] = useState<string[]>();
  const pathname = useLocation().pathname;

  useEffect(() => {
    const fetchPreviousConversations = async () => {
      const response = await fetch('http://127.0.0.1:8085/chats');
      const { chats } = await response.json();
      setPreviousConversations(chats);
    };
    fetchPreviousConversations();
  }, [pathname]);

  return (
    <div className={classlist}>
      <main className={mc('chat-history__main')}>
        <Outlet />
      </main>
      <aside className={mc('chat-history__sidebar')}>
        <div className={mc('chat-history__sidebar-title')}>
          <span className={mc('chat-history__sidebar-title-text')}>Conversation History</span>
          <Link className={mc('chat-history__sidebar-title-icon')} to={'/'}>
            <svg viewBox="0 -960 960 960" fill="#000000">
              <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" />
            </svg>
          </Link>
        </div>
        <div className={mc('chat-history__sidebar-list')}>
          {/* New Conversation Button */}
          <Link className={mc('chat-history__sidebar-new-conversation')} to={`/`}>
            <button className={mc('chat-history__new-conversation-button')}>➕ New Conversation</button>
          </Link>

          {/* List of Previous Conversations */}
          {previousConversations?.map((conversation) => (
            <Link className={mc('chat-history__sidebar-link')} to={`/conversation/${conversation}`} key={conversation}>
              {conversation}
            </Link>
          ))}
        </div>
        <div className={mc('chat-history__sidebar-upload-container')}>
          <Link to="/upload" className={mc('chat-history__sidebar-upload')}>
            <span className={mc('chat-history__sidebar-upload-text')}>Upload Files</span>
            <span className={mc('chat-history__sidebar-upload-icon')}>
              <svg viewBox="0 -960 960 960" fill="#000000">
                <path d="M440-320v-326L336-542l-56-58 200-200 200 200-56 58-104-104v326h-80ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z" />
              </svg>
            </span>
          </Link>
        </div>
      </aside>
    </div>
  );
}
