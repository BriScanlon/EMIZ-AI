// Styles
import useClassList, { mapClassesCurried } from '@blocdigital/useclasslist';
import maps from './index.module.scss';
import { useRef, useState } from 'react';

const mc = mapClassesCurried(maps, true) as (c: string) => string;

// Types
export interface UploadProps {
  className?: HTMLElement['className'];
}

export default function Upload({ className }: UploadProps) {
  const classlist = useClassList({ defaultClass: 'upload', className, maps, string: true }) as string;

  const inputRef = useRef<HTMLInputElement>(null);

  const [Loading, setLoading] = useState(false);
  const [Response, setResponse] = useState<string>();

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setResponse('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('http://localhost:8085/documents', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Failed to upload file');
      }

      const data = await res.json();
      if (inputRef.current) inputRef.current.value = '';

      setResponse('File uploaded successfully');
      console.log(data);
    } catch (error) {
      setResponse((error as Error).message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={classlist}>
      <div className={mc('upload__content')}>
        {Loading && <div>uploading...</div>}
        <input type="file" accept=".pdf" onChange={handleUpload} ref={inputRef}></input>
        {Response && <div>{Response}</div>}
      </div>
    </div>
  );
}
