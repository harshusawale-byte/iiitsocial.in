'use client';

import { useState } from 'react';
import ImageViewer from './ImageViewer';

interface ClickableImageProps {
  src: string;
  alt?: string;
  className?: string;
}

export default function ClickableImage({ src, alt, className }: ClickableImageProps) {
  const [zoomed, setZoomed] = useState(false);

  return (
    <>
      <img
        src={src}
        alt={alt || ''}
        className={`${className} cursor-pointer`}
        loading="lazy"
        onClick={(e) => {
          e.stopPropagation();
          setZoomed(true);
        }}
      />
      {zoomed && <ImageViewer src={src} alt={alt} onClose={() => setZoomed(false)} />}
    </>
  );
}
