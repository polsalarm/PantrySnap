import { useEffect, useState } from 'react';
import Icon from './Icon';

export default function PhotoThumb({ blob, alt, className = '' }: { blob?: Blob; alt: string; className?: string }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!blob) {
      setUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(blob);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [blob]);

  if (!url) {
    return (
      <div className={`bg-border-soft flex items-center justify-center text-text-muted ${className}`}>
        <Icon name="image" />
      </div>
    );
  }

  return <img src={url} alt={alt} className={`object-cover ${className}`} />;
}
