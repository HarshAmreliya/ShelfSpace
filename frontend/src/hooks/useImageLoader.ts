"use client";

import { useState, useCallback, useEffect } from "react";

interface UseImageLoaderProps {
  src: string;
  fallbackSrc?: string;
  preload?: boolean;
}

interface UseImageLoaderReturn {
  currentSrc: string;
  isLoading: boolean;
  hasError: boolean;
  retry: () => void;
}

export function useImageLoader({
  src,
  fallbackSrc = "/book-covers/default.jpg",
  preload = false,
}: UseImageLoaderProps): UseImageLoaderReturn {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const retry = useCallback(() => {
    setCurrentSrc(src);
    setIsLoading(true);
    setHasError(false);
  }, [src]);

  const handleError = useCallback(() => {
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setIsLoading(true);
      setHasError(false);
    } else {
      setIsLoading(false);
      setHasError(true);
    }
  }, [currentSrc, fallbackSrc]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);

  // Preload image if requested
  useEffect(() => {
    if (preload && src) {
      const img = new window.Image();
      img.onload = handleLoad;
      img.onerror = handleError;
      img.src = src;
    }
  }, [src, preload, handleLoad, handleError]);

  // Reset state when src changes
  useEffect(() => {
    setCurrentSrc(src);
    setIsLoading(true);
    setHasError(false);
  }, [src]);

  return {
    currentSrc,
    isLoading,
    hasError,
    retry,
  };
}

export default useImageLoader;
