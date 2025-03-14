import Markdown from 'react-markdown';

// styles
import useClassList, { mapClassesCurried } from '@blocdigital/useclasslist';
import maps from './ChatThinking.module.scss';

const mc = mapClassesCurried(maps, true);

export default function ChatThinking({ thinking }: { thinking: string }) {
  const classlist = useClassList({ defaultClass: 'thinking', maps, string: true });
  return (
    <div className={classlist}>
      <details className={mc('thinking__bubble')}>
        <summary className={mc('thinking__summary')}>Thinking...</summary>
        <Markdown>{thinking}</Markdown>
      </details>
    </div>
  );
}
