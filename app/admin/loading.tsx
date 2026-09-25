export default function AdminLoading() {
  return (
    <div className="max-w-5xl space-y-6 animate-pulse">
      <div>
        <div className="h-8 bg-slate-200 rounded w-1/4 mb-2"></div>
        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
      </div>

      <section className="card overflow-x-auto p-5">
        <div className="space-y-4">
          <div className="h-10 bg-slate-200 rounded w-full"></div>
          <div className="h-10 bg-slate-200 rounded w-full"></div>
          <div className="h-10 bg-slate-200 rounded w-full"></div>
          <div className="h-10 bg-slate-200 rounded w-full"></div>
        </div>
      </section>
    </div>
  );
}
