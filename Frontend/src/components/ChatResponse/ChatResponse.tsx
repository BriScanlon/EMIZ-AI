import Markdown from 'react-markdown';
import { Link,useNavigate, useLocation } from 'react-router';

// styles
import useClassList, { mapClassesCurried } from '@blocdigital/useclasslist';
import maps from './ChatResponse.module.scss';
const mc = mapClassesCurried(maps, true);

export default function ChatResponse({
  response,
  conversationId,
  index,
  graph,
}: {
  response: string;
  conversationId: string;
  index: number;
  graph?: any; // Graph data (optional)
}) {
  const classlist = useClassList({ defaultClass: 'response', maps, string: true });
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Check if the current page is already showing the graph
  const isGraphOpen = location.pathname.includes(`/conversation/${conversationId}/extension/graph/${index}`);

  // ✅ Toggle behavior: Open if closed, go back if already open
  const handleGraphClick = (event: React.MouseEvent) => {
    event.preventDefault();
    if (isGraphOpen) {
      navigate(-1); // Go back one step in history
    } else {
      navigate(`/conversation/${conversationId}/extension/graph/${index}`);
    }
  };

   // ✅ Check if graph data exists
   const hasGraphData = graph && Object.keys(graph).length > 0 && (graph.nodes?.length || graph.links?.length);

   return (
    <div className={classlist}>
      <div className={mc('response__bubble')}>
        <Markdown>{response}</Markdown>
        <div className={mc('response__actions')}>
          <button
            onClick={handleGraphClick} // ✅ Handles toggle behavior
            disabled={!hasGraphData}
            className={mc('response__actions-graph')}
            aria-label="Show/Hide graph"
            title="Show/Hide graph"
            style={{
              opacity: hasGraphData ? 1 : 0.5,
              pointerEvents: hasGraphData ? 'auto' : 'none',
            }}
          >
            📊 {isGraphOpen ? "Close Graph" : "View Graph"}
          </button>
        </div>
      </div>
    </div>
  );
}