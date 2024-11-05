// app/components/CloudinaryImage.js
"use client";

import { useState } from 'react';
import { CldImage } from 'next-cloudinary';
import { DEFAULT_AVATAR_URL, DEFAULT_AVATAR_ID } from '@/app/constants/images';

export function CloudinaryImage({ src, ...props }) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <img 
        src={DEFAULT_AVATAR_URL}
        alt={props.alt || "Default avatar"}
        className={props.className}
        width={props.width}
        height={props.height}
      />
    );
  }

  const publicId = src || DEFAULT_AVATAR_ID;

  return (
    <CldImage
      {...props}
      src={publicId}
      onError={() => setError(true)}
    />
  );
}