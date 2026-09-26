export default function AdminLoading() {
  return (
    <div className="max-w-5xl space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 bg-slate-200 rounded-xl w-1/4"></div>
        <div className="h-4 bg-slate-200 rounded-lg w-1/2"></div>
      </div>

      <div className="grid sm:grid-cols-3 gap-5">
        <div className="h-32 bg-white rounded-2xl border border-slate-200/80 shadow-sm"></div>
        <div className="h-32 bg-white rounded-2xl border border-slate-200/80 shadow-sm"></div>
        <div className="h-32 bg-white rounded-2xl border border-slate-200/80 shadow-sm"></div>
      </div>

      <div className="card p-6 bg-white rounded-2xl border border-slate-200/80 space-y-4">
        <div className="h-10 bg-slate-100 rounded-xl w-full"></div>
        <div className="h-10 bg-slate-100 rounded-xl w-full"></div>
        <div className="h-10 bg-slate-100 rounded-xl w-full"></div>
      </div>
    </div>
  );
}
