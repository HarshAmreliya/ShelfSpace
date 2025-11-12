import {
  BookCardSkeleton,
  Skeleton,
} from "@/components/skeletons/SkeletonComponents";

export default function DiscoverLoading() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Filter bar */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Skeleton className="h-10 w-24 flex-shrink-0" />
        <Skeleton className="h-10 w-24 flex-shrink-0" />
        <Skeleton className="h-10 w-24 flex-shrink-0" />
        <Skeleton className="h-10 w-24 flex-shrink-0" />
        <Skeleton className="h-10 w-24 flex-shrink-0" />
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <BookCardSkeleton />
        <BookCardSkeleton />
        <BookCardSkeleton />
        <BookCardSkeleton />
        <BookCardSkeleton />
        <BookCardSkeleton />
        <BookCardSkeleton />
        <BookCardSkeleton />
      </div>
    </div>
  );
}
