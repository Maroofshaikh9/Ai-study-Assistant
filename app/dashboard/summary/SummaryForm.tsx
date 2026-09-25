"use client";

import { useState } from "react";
import DocumentSelect from "@/components/DocumentSelect";
import Notice from "@/components/Notice";

type Note = { id: string; filename: string };
type SummaryAttempt = {
  _id?: string;
  documentId: string;
  documentName: string;
  length: string;
  summary: string;
  createdAt: string;
};

export default function SummaryForm({ initialNotes }: { initialNotes: Note[] }) {
  const [view, setView] = useState<"setup" | "result" | "history">("setup");
  const [documentId, setDocumentId] = useState(initialNotes[0]?.id || "");
  const [summaryLength, setSummaryLength] = useState("Medium");
  
  const [currentResult, setCurrentResult] = useState<SummaryAttempt | null>(null);
  const [history, setHistory] = useState<SummaryAttempt[]>([]);
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
        setError(data.error || "Could not generate a summary.");
        return;
      }
      
      const docName = initialNotes.find(n => n.id === documentId)?.filename || "Unknown Document";
      const attemptData = {
        documentId,
        documentName: docName,
        length: summaryLength,
        summary: data.summary,
      };

      try {
        const historyRes = await fetch("/api/summary/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(attemptData)
        });
        const historyData = await historyRes.json();
        
        setCurrentResult({ 
          ...attemptData, 
          createdAt: new Date().toISOString(), 
          _id: historyRes.ok ? historyData.summaryId : undefined 
        });
      } catch {
        setCurrentResult({ ...attemptData, createdAt: new Date().toISOString() });
      }

      setView("result");
      setLoading(false);
    } catch {
      setLoading(false);
      setError("Network error. Please try again.");
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

  return (
    <>
      {view === "setup" && (
        <div className="card p-5 space-y-4">
          <Notice type="error" text={error} />
          
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-800">Generate a Summary</h2>
            <button onClick={loadHistory} disabled={loading} className="text-sm font-medium text-brand-700 hover:underline">
              History
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Selected document</label>
            <DocumentSelect notes={initialNotes} value={documentId} onChange={setDocumentId} />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Summary Length</label>
            <select
              value={summaryLength}
              onChange={(e) => setSummaryLength(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
              disabled={loading}
            >
              <option value="Short">Short (Quick revision)</option>
              <option value="Medium">Medium (Balanced study)</option>
              <option value="Large">Large (Detailed study)</option>
            </select>
          </div>

          <button
            type="button"
            onClick={generate}
            disabled={loading || !documentId}
            className="w-full bg-brand-700 text-white px-4 py-2.5 rounded-md disabled:opacity-60 transition-colors"
          >
            {loading ? "Generating Summary..." : "Generate Summary"}
          </button>
        </div>
      )}

      {view === "result" && currentResult && (
        <section className="mt-4">
          <div className="card p-5 space-y-4 print:border-none print:shadow-none print:p-0">
            {/* Print Only Header */}
            <div className="hidden print:block mb-6 border-b pb-4">
              <h1 className="text-3xl font-bold text-slate-800">StudyMate</h1>
              <h2 className="text-xl text-slate-600 mt-1">AI Summary</h2>
              <div className="mt-4 text-sm text-slate-500 space-y-1">
                <p><span className="font-semibold text-slate-700">Document:</span> {currentResult.documentName}</p>
                <p><span className="font-semibold text-slate-700">Length:</span> {currentResult.length}</p>
                <p><span className="font-semibold text-slate-700">Date:</span> {new Date(currentResult.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex justify-between items-center print:hidden">
              <h2 className="text-xl font-bold text-slate-800">Summary</h2>
            </div>
            
            <div className="flex flex-wrap gap-3 pb-4 border-b border-slate-100 print:hidden">
              <button onClick={() => setView("setup")} className="bg-brand-700 text-white px-4 py-2 rounded-md text-sm transition-colors">
                New Summary
              </button>
              <button onClick={() => window.print()} className="border border-brand-700 text-brand-700 px-4 py-2 rounded-md text-sm hover:bg-brand-50 transition-colors">
                Download PDF
              </button>
              <button onClick={loadHistory} className="border border-slate-300 text-slate-700 px-4 py-2 rounded-md text-sm hover:bg-slate-50 transition-colors">
                History
              </button>
            </div>
            
            <div className="mt-4 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed print:text-black">
              {currentResult.summary}
            </div>
          </div>
        </section>
      )}

      {view === "history" && (
        <div className="space-y-4 mt-4">
          <Notice type="error" text={error} />
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-800">Summary History</h2>
            <button onClick={() => setView("setup")} className="text-sm font-medium text-brand-700 hover:underline">
              Back to Start
            </button>
          </div>
          
          {history.length === 0 ? (
            <div className="card p-8 text-center text-slate-500">
              <p>No summary history yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((attempt, i) => (
                <div key={i} className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-medium text-slate-800">{attempt.documentName}</h3>
                    <div className="text-sm text-slate-500 space-x-2 mt-1">
                      <span>{attempt.length}</span>
                      <span>•</span>
                      <span>{new Date(attempt.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => { setCurrentResult(attempt); setView("result"); }}
                    className="bg-brand-50 border border-brand-200 text-brand-700 px-3 py-1.5 rounded-md text-sm hover:bg-brand-100 transition-colors whitespace-nowrap"
                  >
                    View Summary
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
