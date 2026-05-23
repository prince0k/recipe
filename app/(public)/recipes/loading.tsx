export default function RecipesLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-12">
        <div className="h-10 w-64 bg-muted rounded-lg mb-4" />
        <div className="h-5 w-96 bg-muted/60 rounded-lg" />
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-[2.5rem] p-4 shadow-sm">
            <div className="h-64 rounded-[2rem] bg-muted mb-6" />
            <div className="px-4 pb-4 space-y-3">
              <div className="flex gap-4">
                <div className="h-4 w-16 bg-muted rounded" />
                <div className="h-4 w-16 bg-muted rounded" />
              </div>
              <div className="h-7 w-3/4 bg-muted rounded" />
              <div className="h-4 w-24 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
