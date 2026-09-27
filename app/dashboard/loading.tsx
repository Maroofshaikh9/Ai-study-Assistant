export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse max-w-7xl mx-auto">
      {/* Page Header Skeleton */}
      <div className="space-y-2">
        <div className="h-3.5 w-24 bg-brand-100/60 rounded-full"></div>
        <div className="h-8 w-56 sm:w-72 bg-slate-200 rounded-xl"></div>
        <div className="h-3.5 w-80 max-w-full bg-slate-100 rounded"></div>
      </div>

      {/* Content Container Skeleton */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="h-5 w-44 bg-slate-200 rounded-lg"></div>
          <div className="h-8 w-32 bg-slate-100 rounded-xl"></div>
        </div>

        <div className="h-11 w-full bg-slate-100 rounded-xl"></div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          <div className="h-28 bg-slate-50 border border-slate-100 rounded-2xl"></div>
          <div className="h-28 bg-slate-50 border border-slate-100 rounded-2xl"></div>
          <div className="h-28 bg-slate-50 border border-slate-100 rounded-2xl hidden sm:block"></div>
        </div>

        <div className="h-36 bg-slate-50/70 border border-slate-100 rounded-2xl"></div>
      </div>
    </div>
  );
}
