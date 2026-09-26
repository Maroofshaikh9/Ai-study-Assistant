import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function Notice({
  type,
  text,
}: {
  type: "error" | "success";
  text: string;
}) {
  if (!text) {
    return null;
  }

  const isError = type === "error";

  return (
    <div
      role="alert"
      className={`animate-fade-in-up flex items-start gap-3 rounded-xl p-3.5 text-sm border font-medium transition-all ${
        isError
          ? "bg-rose-50/90 text-rose-800 border-rose-200/80 shadow-sm shadow-rose-100"
          : "bg-emerald-50/90 text-emerald-800 border-emerald-200/80 shadow-sm shadow-emerald-100"
      }`}
    >
      <div className="shrink-0 mt-0.5">
        {isError ? (
          <AlertCircle className="w-4 h-4 text-rose-600" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        )}
      </div>
      <p className="leading-relaxed">{text}</p>
    </div>
  );
}
