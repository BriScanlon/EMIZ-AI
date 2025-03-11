import useClassList from '@blocdigital/useclasslist';
import maps from './Graph.module.scss';

export default function Graph({ className }: { className?: string }) {
  const classlist = useClassList({ defaultClass: 'graph', className, maps, string: true }) as string;
  return <div className={classlist}></div>;
}
