"use client";

import React, { useState, useCallback } from "react";
import Image, { ImageProps } from "next/image";
import { cn } from "@/utils/cn";

interface OptimizedImageProps extends Omit<ImageProps, "onError"> {
  fallbackSrc?: string;
  showFallback?: boolean;
  fallbackClassName?: string;
  onError?: (error: any) => void;
}

export function OptimizedImage({
  src,
  alt,
  fallbackSrc = "/book-covers/default.jpg",
  showFallback = true,
  fallbackClassName,
  className,
  onError,
  ...props
}: OptimizedImageProps) {
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = useCallback(
    (error: unknown) => {
      setError(true);
      setIsLoading(false);
      onError?.(error);
    },
    [onError]
  );

  const handleLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  if (error && showFallback) {
    return (
      <Image
        {...props}
        src={fallbackSrc}
        alt={alt}
        className={cn(className, fallbackClassName)}
        onLoad={handleLoad}
        onError={() =>
          console.warn(`Failed to load fallback image: ${fallbackSrc}`)
        }
      />
    );
  }

  if (error && !showFallback) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500",
          className
        )}
      >
        <span className="text-xs">No image</span>
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 animate-pulse",
            className
          )}
        >
          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
        </div>
      )}
      <Image
        {...props}
        src={src}
        alt={alt}
        className={cn(
          className,
          isLoading
            ? "opacity-0"
            : "opacity-100 transition-opacity duration-300"
        )}
        onLoad={handleLoad}
        onError={handleError}
      />
    </>
  );
}

export { OptimizedImage as default };
