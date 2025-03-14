// Styles
import useClassList, { mapClassesCurried } from '@blocdigital/useclasslist';
import maps from './ChatExtension.module.scss';
import { Outlet, useParams } from 'react-router';
import Chat from '../../components/Chat';
import useChat, { ChatContext } from '../../contexts/chatContext';

const mc = mapClassesCurried(maps, true) as (c: string) => string;

// Types
export interface ChatExtensionProps {
  className?: HTMLElement['className'];
}

export default function ChatExtension({ className }: ChatExtensionProps) {
  const classlist = useClassList({ defaultClass: 'chat-extension', className, maps, string: true }) as string;

  const { conversationId } = useParams();

  const chat = useChat({ conversationId: conversationId || 'ERROR' });

  return (
    <ChatContext.Provider value={chat}>
      <div className={classlist}>
        <Chat className={mc('chat-extension__chat')} />
        <div className={mc('chat-extension__content')}>
          <Outlet />
        </div>
      </div>
    </ChatContext.Provider>
  );
}
