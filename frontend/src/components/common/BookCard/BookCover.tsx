"use client";

import React, { memo } from "react";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { cn } from "@/utils/cn";

interface BookCoverProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  width?: string;
  height?: string;
}

export const BookCover: React.FC<BookCoverProps> = memo(({
  src,
  alt,
  className,
  sizes = "64px",
  width,
  height,
}) => {
  return (
    <div className={cn("relative", width, height)}>
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        className={cn("object-cover rounded shadow-sm", className)}
        sizes={sizes}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
        fallbackSrc="/book-covers/default.jpg"
        showFallback={true}
      />
    </div>
  );
});

BookCover.displayName = "BookCover";
