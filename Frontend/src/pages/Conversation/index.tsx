// styles
import useClassList, { mapClassesCurried } from '@blocdigital/useclasslist';
import maps from './index.module.scss';
import Chat from '../../components/Chat';
import { useParams } from 'react-router';
import useChat, { ChatContext } from '../../contexts/chatContext';

const mc = mapClassesCurried(maps, true);

export default function Home() {
  const classlist = useClassList({ defaultClass: 'conversation', maps, string: true });

  const { conversationId } = useParams();

  const chat = useChat({ conversationId: conversationId || 'ERROR' });

  return (
    <ChatContext.Provider value={chat}>
      <div className={classlist}>
        <Chat className={mc('conversation__chat')} />
      </div>
    </ChatContext.Provider>
  );
}
