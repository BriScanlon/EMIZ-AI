import { Fragment, useContext, useMemo, useRef } from 'react';
import { useParams } from 'react-router';

// Styles
import useClassList, { mapClassesCurried } from '@blocdigital/useclasslist';
import maps from './Chat.module.scss';
const mc = mapClassesCurried(maps, true) as (c: string) => string;

// components
import ChatThinking from '../ChatThinking';
import ChatQuery from '../ChatQuery';
import ChatResponse from '../ChatResponse';
import ChatInput from '../ChatInput';

// contexts
import { ChatContext } from '../../contexts/chatContext';

// Types
export interface ChatProps {
  className?: HTMLElement['className'];
}

export default function Chat({ className }: ChatProps) {
  const classlist = useClassList({ defaultClass: 'chat', className, maps, string: true }) as string;

  const { conversationId } = useParams();

  const chatInputRef = useRef<HTMLInputElement>(null);

  const { Loading, conversationHistory, handleQuery, error, latestQuery } = useContext(ChatContext) || {};

  const history = useMemo(
    () =>
      conversationHistory?.map((chatMessage) => {
        const response = chatMessage.results?.[0].message;

        return { response, timestamp: chatMessage.timestamp, query: chatMessage.query };
      }),
    [conversationHistory],
  );

  return (
    <div className={classlist}>
      <div className={mc('chat__messages')}>
        {Loading && <ChatThinking thinking="Thinking..." />}
        {Loading && <ChatQuery query={latestQuery || 'ERROR'} />}
        {error && <ChatResponse response={error} conversationId={conversationId || 'ERROR'} index={0} />}
        {history?.map(({ response, timestamp, query }, index) => {
          return (
            <Fragment key={timestamp}>
              <ChatResponse response={response} conversationId={conversationId || 'ERROR'} index={index} />
              <ChatQuery query={query} />
            </Fragment>
          );
        })}
      </div>
      <ChatInput handleQuery={handleQuery} loading={Loading} ref={chatInputRef} />
    </div>
  );
}
