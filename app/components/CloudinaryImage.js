// app/components/CloudinaryImage.js
"use client";

import { useState } from 'react';
import Image from 'next/image';

export function CloudinaryImage({ src, ...props }) {
  const [error, setError] = useState(false);
  const imageSrc = error || !src ? '/noavatar.png' : src;

  return (
    <Image 
      {...props}
      src={imageSrc}
      alt={props.alt || "Default avatar"}
      onError={() => setError(true)}
    />
  );
}