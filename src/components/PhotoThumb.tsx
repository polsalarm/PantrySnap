import { useState, useEffect } from 'react';
import { DynamicFoodIcon } from './FoodIcons';

export default function PhotoThumb({ blob, alt = '', className = '' }: { blob?: Blob; alt?: string; className?: string }) {
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
      <div className={`bg-sky-50 border-2 border-sky-100 flex items-center justify-center p-1.5 shadow-2xs select-none ${className}`}>
        <DynamicFoodIcon name={alt} size={28} />
      </div>
    );
  }

  return <img src={url} alt={alt} className={`object-cover ${className}`} />;
}
