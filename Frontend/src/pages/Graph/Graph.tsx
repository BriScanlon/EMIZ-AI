import { useParams } from 'react-router';
import { useContext } from 'react';

// Styles
import useClassList, { mapClassesCurried } from '@blocdigital/useclasslist';
import maps from './Graph.module.scss';

const mc = mapClassesCurried(maps, true) as (c: string) => string;

// Components
import ForceGraph from '../../components/ForceGraph';

// Contexts
import { ChatContext } from '../../contexts/chatContext.js';

// Types
export interface GraphProps {
  className?: HTMLElement['className'];
}

export default function Graph({ className }: GraphProps) {
  const classlist = useClassList({ defaultClass: 'graph', className, maps, string: true }) as string;

  const { conversationHistory } = useContext(ChatContext) || {};
  const { message_index } = useParams();

  // oh boy, I hope the data is there
  const graphData =
  conversationHistory?.[parseInt(message_index || '0')]?.results?.[0]?.graph ?? {
    nodes: [],
    links: [],
    categories: [],
  };

  return (
    <div className={classlist}>
      {Object.keys(graphData || {}).length > 0 ? (
        <ForceGraph graphData={graphData}/>
      ) : (
        <div className={mc('graph__error')}>Unfortunately A graph was not available for this request.</div>
      )}
    </div>
  );
}
