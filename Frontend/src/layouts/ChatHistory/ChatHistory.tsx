import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router';

// Styles
import useClassList, { mapClassesCurried } from '@blocdigital/useclasslist';
import maps from './ChatHistory.module.scss';
const mc = mapClassesCurried(maps, true);

// Chat Item Component
function ChatItem({
  chatName,
  onRename,
  onDelete,
  isEditing,
  setEditingChat,
  newChatName,
  setNewChatName,
}) {
  return (
    <div key={chatName} className={mc('chat-history__conversation-item')}>
      <Link className={mc('chat-history__sidebar-link')} to={`/conversation/${chatName}`}>
        {chatName}
      </Link>

      {/* Rename Input or Button */}
      {isEditing ? (
        <div className={mc('chat-history__rename-container')}>
          <input
            type="text"
            value={newChatName}
            onChange={(e) => setNewChatName(e.target.value)}
            maxLength={12}
            className={mc('chat-history__rename-input')}
            placeholder="New name..."
          />
          <button onClick={() => onRename(chatName)} className={mc('chat-history__rename-save')}>
            ✅
          </button>
          <button onClick={() => setEditingChat(null)} className={mc('chat-history__rename-cancel')}>
            ❌
          </button>
        </div>
      ) : (
        <button onClick={() => setEditingChat(chatName)} className={mc('chat-history__rename-button')}>
          ✏️ Rename
        </button>
      )}

      {/* Delete Button */}
      <button onClick={() => onDelete(chatName)} className={mc('chat-history__delete-button')}>
        🗑️ Delete
      </button>
    </div>
  );
}

export default function ChatHistory() {
  const classlist = useClassList({ defaultClass: 'chat-history', maps, string: true });
  const [previousConversations, setPreviousConversations] = useState<string[]>([]);
  const [editingChat, setEditingChat] = useState<string | null>(null);
  const [newChatName, setNewChatName] = useState<string>('');
  const pathname = useLocation().pathname;

  // Fetch chat history
  const fetchChatHistory = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8085/chats');
      if (!response.ok) throw new Error('Failed to fetch chat history');
      const { chats } = await response.json();
      setPreviousConversations(chats);
    } catch (error) {
      console.error('🚨 Error fetching chat history:', error);
    }
  };

  useEffect(() => {
    fetchChatHistory();
  }, [pathname]);

  // Delete Chat
  const handleDeleteChat = async (chatName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${chatName}"?`)) return;

    try {
      const response = await fetch(`http://127.0.0.1:8085/chat/${chatName}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete chat');

      await fetchChatHistory(); // Refetch updated chat history
    } catch (error) {
      console.error('🚨 Error deleting chat:', error);
    }
  };

  // Rename Chat
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

      if (!response.ok) throw new Error('Failed to rename chat');

      setEditingChat(null);
      setNewChatName('');
      await fetchChatHistory(); // Refetch updated chat history
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
          
        </div>

        {/* New Conversation Button */}
        <Link className={mc('chat-history__sidebar-new-conversation')} to={`/`}>
          <button className={mc('chat-history__new-conversation-button')}>➕ New Conversation</button>
        </Link>

        {/* List of previous conversations */}
        <div className={mc('chat-history__sidebar-list')}>
          {previousConversations?.map((conversation) => (
            <ChatItem
              key={conversation}
              chatName={conversation}
              onRename={handleRenameChat}
              onDelete={handleDeleteChat}
              isEditing={editingChat === conversation}
              setEditingChat={setEditingChat}
              newChatName={newChatName}
              setNewChatName={setNewChatName}
            />
          ))}
        </div>
      </aside>
    </div>
  );
}
