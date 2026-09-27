"use client";

import { useState } from "react";
import DocumentSelect from "@/components/DocumentSelect";
import Notice from "@/components/Notice";
import FormattedSummary from "@/components/FormattedSummary";
import {
  Sparkles,
  History,
  Copy,
  Check,
  Printer,
  PlusCircle,
  Calendar,
  Loader2,
  ArrowRight,
  BookOpen,
  Code2,
  Eye,
} from "lucide-react";

type Note = { id: string; filename: string };
type SummaryAttempt = {
  _id?: string;
  documentId: string;
  documentName: string;
  length: string;
  summary: string;
  createdAt: string;
};

const lengthOptions = [
  {
    id: "Short",
    title: "Concise Revision",
    badge: "1-2 Pages",
    desc: "Key definitions, high-yield takeaways, and quick exam bullet points.",
  },
  {
    id: "Medium",
    title: "Standard Study",
    badge: "3-5 Pages",
    desc: "Balanced synthesis covering core arguments, concepts, and key equations.",
  },
  {
    id: "Large",
    title: "In-Depth Synthesis",
    badge: "6+ Pages",
    desc: "Exhaustive breakdown of lectures, sub-sections, and detailed theory.",
  },
];

export default function SummaryForm({ initialNotes }: { initialNotes: Note[] }) {
  const [view, setView] = useState<"setup" | "result" | "history">("setup");
  const [documentId, setDocumentId] = useState(initialNotes[0]?.id || "");
  const [summaryLength, setSummaryLength] = useState("Medium");

  const [currentResult, setCurrentResult] = useState<SummaryAttempt | null>(null);
  const [history, setHistory] = useState<SummaryAttempt[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  async function generate() {
    if (loading || !documentId) return;
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId, length: summaryLength }),
      });

      const data = await response.json();

      if (!response.ok) {
        setLoading(false);
        setError(data.error || "Could not generate summary.");
        return;
      }

      // Persist to history
      await fetch("/api/summary/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId,
          length: summaryLength,
          summary: data.summary,
        }),
      }).catch(() => null);

      const docName = initialNotes.find((n) => n.id === documentId)?.filename || "Document";

      setCurrentResult({
        documentId,
        documentName: docName,
        length: summaryLength,
        summary: data.summary,
        createdAt: new Date().toISOString(),
      });

      setShowRaw(false);
      setView("result");
    } catch {
      setError("An unexpected network error occurred while generating summary.");
    } finally {
      setLoading(false);
    }
  }

  async function loadHistory() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/summary/history");
      const data = await response.json();
      if (response.ok) {
        setHistory(data.summaries || []);
        setView("history");
      } else {
        setError(data.error || "Could not load history.");
      }
    } catch {
      setError("Network error loading history.");
    }
    setLoading(false);
  }

  function handleCopy() {
    if (!currentResult?.summary) return;
    navigator.clipboard.writeText(currentResult.summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      <Notice type="error" text={error} />

      {/* SETUP VIEW */}
      {view === "setup" && (
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-card space-y-6 print:hidden">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200/60 text-teal-700 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Summary Generator</h2>
                <p className="text-xs text-slate-500">Configure parameters for structured AI synthesis</p>
              </div>
            </div>

            <button
              type="button"
              onClick={loadHistory}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-brand-700 hover:bg-slate-100 transition-colors"
            >
              <History className="w-3.5 h-3.5" />
              <span>Past Summaries</span>
            </button>
          </div>

          {/* Document Select */}
          <DocumentSelect notes={initialNotes} value={documentId} onChange={setDocumentId} />

          {/* Length Selector Cards */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Select Summary Depth
            </label>
            <div className="grid sm:grid-cols-3 gap-3">
              {lengthOptions.map((opt) => {
                const isSelected = summaryLength === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSummaryLength(opt.id)}
                    className={`rounded-2xl border p-4 text-left transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "border-brand-500 bg-brand-50/50 shadow-xs ring-2 ring-brand-500/20"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-xs font-bold ${isSelected ? "text-brand-800" : "text-slate-800"}`}>
                        {opt.title}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          isSelected ? "bg-brand-100 text-brand-700" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {opt.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{opt.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Generate Button */}
          <button
            type="button"
            onClick={generate}
            disabled={loading || !documentId}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl py-3 px-6 text-sm font-bold text-white bg-gradient-to-r from-brand-600 via-brand-700 to-teal-600 hover:from-brand-700 hover:to-teal-700 shadow-md shadow-brand-500/25 hover:shadow-lg hover:shadow-brand-500/35 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Reading PDF &amp; Structuring Academic Summary...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Formatted AI Summary</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}

      {/* RESULT VIEW */}
      {view === "result" && currentResult && (
        <section className="space-y-4">
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-9 shadow-card print:border-none print:shadow-none print:p-0 space-y-6">
            {/* Print Header */}
            <div className="hidden print:block print-academic-header">
              <div className="flex justify-between items-baseline border-b border-slate-900 pb-2 mb-3">
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-slate-950 uppercase">StudyMate</h1>
                  <p className="text-xs font-medium text-slate-600 tracking-wide">Academic Study Assistant • AI Document Synthesis</p>
                </div>
                <div className="text-right text-xs text-slate-700">
                  <p><span className="font-semibold text-slate-900">Document:</span> {currentResult.documentName}</p>
                  <p><span className="font-semibold text-slate-900">Date:</span> {new Date(currentResult.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="mb-3">
                <h2 className="text-base font-bold text-slate-900">{currentResult.length} Academic Summary</h2>
              </div>
            </div>

            {/* Document Meta Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 print:hidden">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 border border-brand-200/60 uppercase">
                    {currentResult.length} Summary
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(currentResult.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 truncate">
                  {currentResult.documentName}
                </h2>
              </div>

              {/* Action Buttons Toolbar */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowRaw(!showRaw)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  title="Toggle Formatted / Raw Markdown"
                >
                  {showRaw ? (
                    <>
                      <Eye className="w-3.5 h-3.5 text-brand-600" />
                      <span>Formatted View</span>
                    </>
                  ) : (
                    <>
                      <Code2 className="w-3.5 h-3.5 text-slate-500" />
                      <span>Raw Text</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  title="Copy markdown to clipboard"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  <span>Print / PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setView("setup")}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-600 text-xs font-bold text-white hover:bg-brand-700 transition-colors shadow-xs"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>New Summary</span>
                </button>
              </div>
            </div>

            {/* Formatted Text Content */}
            <div className="selection:bg-brand-100 selection:text-brand-900 print:text-black">
              {showRaw ? (
                <pre className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                  {currentResult.summary}
                </pre>
              ) : (
                <FormattedSummary content={currentResult.summary} />
              )}
            </div>
          </div>
        </section>
      )}

      {/* HISTORY VIEW */}
      {view === "history" && (
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-card space-y-5 print:hidden">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Summary Archive</h2>
              <p className="text-xs text-slate-500">Previously generated revision summaries</p>
            </div>
            <button
              type="button"
              onClick={() => setView("setup")}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 hover:text-brand-800"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Generate New</span>
            </button>
          </div>

          {history.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No summaries generated yet</p>
              <p className="text-xs text-slate-400">Generate your first summary from any uploaded PDF.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {history.map((attempt, i) => (
                <div
                  key={attempt._id || i}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:bg-slate-50/70 p-2 rounded-2xl transition-colors"
                >
                  <div className="space-y-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate group-hover:text-brand-700 transition-colors">
                      {attempt.documentName}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span className="font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                        {attempt.length}
                      </span>
                      <span>•</span>
                      <span>{new Date(attempt.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setCurrentResult(attempt);
                      setShowRaw(false);
                      setView("result");
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors self-end sm:self-center shadow-xs"
                  >
                    <span>Read Summary</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
