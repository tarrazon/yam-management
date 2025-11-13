import { useState, useEffect } from 'react';
import { getSignedUrl } from '@/api/uploadService';

export function useSignedUrl(filePath) {
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadUrl = async () => {
      if (!filePath) {
        setLoading(false);
        return;
      }

      try {
        const signedUrl = await getSignedUrl(filePath);
        if (mounted) {
          setUrl(signedUrl);
          setError(null);
        }
      } catch (err) {
        console.error('Error getting signed URL:', err);
        if (mounted) {
          setError(err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadUrl();

    return () => {
      mounted = false;
    };
  }, [filePath]);

  return { url, loading, error };
}

export function useSignedUrls(filePaths) {
  const [urls, setUrls] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadUrls = async () => {
      if (!filePaths || Object.keys(filePaths).length === 0) {
        setLoading(false);
        return;
      }

      try {
        const urlMap = {};
        await Promise.all(
          Object.entries(filePaths).map(async ([key, path]) => {
            // Handle arrays (multiple files)
            if (Array.isArray(path)) {
              const signedUrls = await Promise.all(
                path.map(p => p ? getSignedUrl(p) : Promise.resolve(null))
              );
              urlMap[key] = signedUrls;
            } else if (path) {
              // Handle single file
              const signedUrl = await getSignedUrl(path);
              urlMap[key] = signedUrl;
            }
          })
        );

        if (mounted) {
          setUrls(urlMap);
          setError(null);
        }
      } catch (err) {
        console.error('Error getting signed URLs:', err);
        if (mounted) {
          setError(err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadUrls();

    return () => {
      mounted = false;
    };
  }, [JSON.stringify(filePaths)]);

  return { urls, loading, error };
}
