import { RefObject } from 'react';

// Styles
import useClassList, { mapClassesCurried } from '@blocdigital/useclasslist';
import maps from './ChatInput.module.scss';

const mc = mapClassesCurried(maps, true) as (c: string) => string;

// Types
export interface ChatInputProps {
  className?: HTMLElement['className'];
  loading?: boolean;
  handleQuery?: (event: React.FormEvent<HTMLFormElement>) => void;
  ref?: RefObject<HTMLInputElement | null>;
}

export default function ChatInput({ className, loading, handleQuery, ref }: ChatInputProps) {
  const classlist = useClassList({ defaultClass: 'chat-input', className, maps, string: true }) as string;

  return (
    <form onSubmit={loading ? () => {} : handleQuery} className={classlist}>
      <input className={mc('chat-input__input')} name="query" autoFocus required ref={ref} autoComplete="off" />
      <button className={mc('chat-input__button')} disabled={loading}>
        Send
      </button>
    </form>
  );
}
