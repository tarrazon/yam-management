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
        console.log('[StorageImage] Loading image from:', src);
        const url = await getSignedUrl(src);
        console.log('[StorageImage] Got URL:', url);
        if (mounted) {
          if (url) {
            setImageUrl(url);
            setError(false);
          } else {
            console.error('[StorageImage] No URL returned');
            setError(true);
          }
        }
      } catch (err) {
        console.error('[StorageImage] Error loading image:', err);
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
