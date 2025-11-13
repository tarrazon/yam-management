import React, { useEffect, useState } from 'react';
import { getSignedUrl } from '@/api/uploadService';

export default function StorageImage({ src, alt, className, fallback }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadImage = async () => {
      if (!src) {
        setLoading(false);
        setError(true);
        return;
      }

      try {
        const url = await getSignedUrl(src);
        if (mounted) {
          if (url) {
            setImageUrl(url);
            setError(false);
          } else {
            setError(true);
          }
        }
      } catch (err) {
        console.error('Error loading image:', err);
        if (mounted) {
          setError(true);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadImage();

    return () => {
      mounted = false;
    };
  }, [src]);

  if (loading) {
    return (
      <div className={`${className} bg-slate-200 animate-pulse`}>
        {fallback}
      </div>
    );
  }

  if (error || !imageUrl) {
    return fallback || <div className={className} />;
  }

  return <img src={imageUrl} alt={alt} className={className} />;
}
