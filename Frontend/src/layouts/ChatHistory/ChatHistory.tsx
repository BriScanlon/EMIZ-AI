import { useEffect, useState } from 'react';

import { Link, Outlet, useLocation } from 'react-router';

// styles
import useClassList, { mapClassesCurried } from '@blocdigital/useclasslist';
import maps from './ChatHistory.module.scss';
const mc = mapClassesCurried(maps, true);

export default function ChatHistory() {
  const classlist = useClassList({ defaultClass: 'chat-history', maps, string: true });

  const [previousConversations, setPreviousConversations] = useState<string[]>();
  const [editingChat, setEditingChat] = useState<string | null>(null);
  const [newChatName, setNewChatName] = useState<string>('');
  const pathname = useLocation().pathname;

  useEffect(() => {
    const fetchPreviousConversations = async () => {
      const response = await fetch('http://127.0.0.1:8085/chats');
      const { chats } = await response.json();
      setPreviousConversations(chats);
    };
    fetchPreviousConversations();
  }, [pathname]);

  // Handle deleting a chat
  const handleDeleteChat = async (chatName: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete "${chatName}"?`);
    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://127.0.0.1:8085/chat/${chatName}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete chat');
      }

      setPreviousConversations(previousConversations.filter((chat) => chat !== chatName));
    } catch (error) {
      console.error('🚨 Error deleting chat:', error);
    }
  };

  // Handle renaming a chat
  const handleRenameChat = async (chatName: string) => {
    if (!newChatName.trim() || newChatName.length > 12) {
      alert('Chat name must be 1-12 characters.');
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8085/rename_chat/${chatName}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_chat_name: newChatName }),
      });

      if (!response.ok) {
        throw new Error('Failed to rename chat');
      }

      setPreviousConversations(previousConversations.map((chat) => (chat === chatName ? newChatName : chat)));
      setEditingChat(null);
      setNewChatName('');
    } catch (error) {
      console.error('🚨 Error renaming chat:', error);
    }
  };

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
        
        {/* New Conversation Button */}
        <Link className={mc('chat-history__sidebar-new-conversation')} to={`/`}>
            <button className={mc('chat-history__new-conversation-button')}>➕ New Conversation</button>
        </Link>

        {/* List of previous conversations */}
        <div className={mc('chat-history__sidebar-list')}>
          {previousConversations?.map((conversation) => (
            <div key={conversation} className={mc('chat-history__conversation-item')}>
              <Link className={mc('chat-history__sidebar-link')} to={`/conversation/${conversation}`}>
                {conversation}
              </Link>

              {/* Rename button */}
              {editingChat === conversation ? (
                <div className={mc('chat-history__rename-container')}>
                  <input
                    type="text"
                    value={newChatName}
                    onChange={(e) => setNewChatName(e.target.value)}
                    maxLength={12}
                    className={mc('chat-history__rename-input')}
                  />
                  <button onClick={() => handleRenameChat(conversation)} className={mc('chat-history__rename-save')}>
                    ✅
                  </button>
                  <button onClick={() => setEditingChat(null)} className={mc('chat-history__rename-cancel')}>
                    ❌
                  </button>
                </div>
              ) : (
                <button onClick={() => setEditingChat(conversation)} className={mc('chat-history__rename-button')}>
                  ✏️ Rename
                </button>
              )}

              {/* Delete button */}
              <button onClick={() => handleDeleteChat(conversation)} className={mc('chat-history__delete-button')}>
                🗑️ Delete
              </button>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}