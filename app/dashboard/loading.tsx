export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse max-w-7xl mx-auto">
      {/* Banner Skeleton */}
      <div className="rounded-3xl bg-slate-200/80 h-44 w-full"></div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 h-28 space-y-3">
            <div className="flex justify-between">
              <div className="h-3 w-16 bg-slate-200 rounded"></div>
              <div className="h-8 w-8 bg-slate-200 rounded-xl"></div>
            </div>
            <div className="h-6 w-12 bg-slate-200 rounded"></div>
          </div>
        ))}
      </div>

      {/* Grid Skeleton */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="rounded-3xl border border-slate-200 bg-white p-5 h-44 space-y-3">
            <div className="h-10 w-10 bg-slate-200 rounded-2xl"></div>
            <div className="h-4 w-28 bg-slate-200 rounded"></div>
            <div className="h-3 w-36 bg-slate-200 rounded"></div>
          </div>
        ))}
      </div>

      {/* Recent Notes Skeleton */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 h-60 space-y-4">
        <div className="h-5 w-40 bg-slate-200 rounded"></div>
        <div className="space-y-3 pt-2">
          <div className="h-10 bg-slate-100 rounded-xl w-full"></div>
          <div className="h-10 bg-slate-100 rounded-xl w-full"></div>
          <div className="h-10 bg-slate-100 rounded-xl w-full"></div>
        </div>
      </div>
    </div>
  );
}
