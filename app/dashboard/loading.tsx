export default function DashboardLoading() {
  return (
    <div className="max-w-4xl space-y-6 animate-pulse">
      <div>
        <div className="h-8 bg-slate-200 rounded w-1/4 mb-2"></div>
        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
      </div>

      <div className="card p-5 space-y-4">
        <div className="h-10 bg-slate-200 rounded w-full"></div>
      </div>

      <section className="card p-5 min-h-[280px] space-y-3">
        <div className="h-16 bg-slate-200 rounded w-full"></div>
        <div className="h-16 bg-slate-200 rounded w-3/4"></div>
      </section>
    </div>
  );
}
