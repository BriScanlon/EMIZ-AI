// styles
import useClassList, { mapClassesCurried } from '@blocdigital/useclasslist';
import maps from './ChatQuery.module.scss';
const mc = mapClassesCurried(maps, true);

export default function ChatQuery({ query }: { query: string }) {
  const classlist = useClassList({ defaultClass: 'query', maps, string: true });
  return (
    <div className={classlist}>
      <div className={mc('query__bubble')}>
        <div className={mc('query__text')}>{query}</div>
      </div>
    </div>
  );
}
