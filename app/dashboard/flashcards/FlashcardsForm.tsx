"use client";

import { useState } from "react";
import DocumentSelect from "@/components/DocumentSelect";
import Notice from "@/components/Notice";

type Note = { id: string; filename: string };
type Card = { front: string; back: string };
type FlashcardAttempt = {
  _id?: string;
  documentId: string;
  documentName: string;
  cardCount: number;
  flashcards: Card[];
  createdAt: string;
};

export default function FlashcardsForm({ initialNotes }: { initialNotes: Note[] }) {
  const [view, setView] = useState<"setup" | "flashcards" | "history">("setup");
  const [documentId, setDocumentId] = useState(initialNotes[0]?.id || "");
  const [cardCount, setCardCount] = useState(10);
  
  const [currentResult, setCurrentResult] = useState<FlashcardAttempt | null>(null);
  const [history, setHistory] = useState<FlashcardAttempt[]>([]);
  
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function generate() {
    if (loading || !documentId) return;
    setError("");
    setLoading(true);
    setIndex(0);
    setFlipped(false);
    
    try {
      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId, count: cardCount }),
      });
      const data = await response.json();

      if (!response.ok) {
        setLoading(false);
        setError(data.error || "Could not generate flashcards.");
        return;
      }
      
      const docName = initialNotes.find(n => n.id === documentId)?.filename || "Unknown Document";
      const attemptData = {
        documentId,
        documentName: docName,
        cardCount: data.cards.length,
        flashcards: data.cards,
      };

      try {
        const historyRes = await fetch("/api/flashcards/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(attemptData)
        });
        const historyData = await historyRes.json();
        
        setCurrentResult({ 
          ...attemptData, 
          createdAt: new Date().toISOString(), 
          _id: historyRes.ok ? historyData.historyId : undefined 
        });
      } catch {
        setCurrentResult({ ...attemptData, createdAt: new Date().toISOString() });
      }

      setView("flashcards");
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
      const response = await fetch("/api/flashcards/history");
      const data = await response.json();
      if (response.ok) {
        setHistory(data.history || []);
        setView("history");
      } else {
        setError(data.error || "Could not load history.");
      }
    } catch {
      setError("Network error loading history.");
    }
    setLoading(false);
  }

  function nextCard() {
    setFlipped(false);
    if (currentResult && index < currentResult.flashcards.length - 1) {
      setIndex(index + 1);
    }
  }

  function prevCard() {
    setFlipped(false);
    if (index > 0) {
      setIndex(index - 1);
    }
  }

  return (
    <>
      {view === "setup" && (
        <div className="card p-5 space-y-4">
          <Notice type="error" text={error} />
          
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-800">Generate Flashcards</h2>
            <button onClick={loadHistory} disabled={loading} className="text-sm font-medium text-brand-700 hover:underline">
              History
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Selected document</label>
            <DocumentSelect notes={initialNotes} value={documentId} onChange={setDocumentId} />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Number of Flashcards</label>
            <select
              value={cardCount}
              onChange={(e) => setCardCount(Number(e.target.value))}
              className="w-full border border-slate-300 rounded-md px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
              disabled={loading}
            >
              {[5, 10, 15, 20, 25, 30].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={generate}
            disabled={loading || !documentId}
            className="w-full bg-brand-700 text-white px-4 py-2.5 rounded-md disabled:opacity-60 transition-colors"
          >
            {loading ? "Generating Flashcards..." : "Generate Flashcards"}
          </button>
        </div>
      )}

      {view === "flashcards" && currentResult && (
        <section className="mt-4">
          <div className="card p-5 space-y-4 print:border-none print:shadow-none print:p-0">
            {/* Print Only Layout */}
            <div className="hidden print:block mb-6 border-b pb-4">
              <h1 className="text-3xl font-bold text-slate-800">StudyMate</h1>
              <h2 className="text-xl text-slate-600 mt-1">AI Flashcards</h2>
              <div className="mt-4 text-sm text-slate-500 space-y-1">
                <p><span className="font-semibold text-slate-700">Document:</span> {currentResult.documentName}</p>
                <p><span className="font-semibold text-slate-700">Number of Flashcards:</span> {currentResult.cardCount}</p>
                <p><span className="font-semibold text-slate-700">Date:</span> {new Date(currentResult.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="hidden print:block space-y-6">
              {currentResult.flashcards.map((card, i) => (
                <div key={i} className="print-break-inside-avoid border p-4 rounded-md">
                  <h3 className="font-bold text-slate-800 mb-2">Flashcard {i + 1}</h3>
                  <div className="mb-3">
                    <p className="text-xs text-slate-500 font-semibold mb-1">Question:</p>
                    <p className="text-slate-800">{card.front}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold mb-1">Answer:</p>
                    <p className="text-slate-800">{card.back}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Interactive UI Layout */}
            <div className="print:hidden">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-800">Flashcards</h2>
                <div className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                  {index + 1} / {currentResult.cardCount}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3 pb-4 mb-4 border-b border-slate-100">
                <button onClick={() => setView("setup")} className="bg-brand-700 text-white px-4 py-2 rounded-md text-sm transition-colors">
                  New Flashcards
                </button>
                <button onClick={() => window.print()} className="border border-brand-700 text-brand-700 px-4 py-2 rounded-md text-sm hover:bg-brand-50 transition-colors">
                  Download PDF
                </button>
                <button onClick={loadHistory} className="border border-slate-300 text-slate-700 px-4 py-2 rounded-md text-sm hover:bg-slate-50 transition-colors">
                  History
                </button>
              </div>

              <div className="card p-6 sm:p-10 border-2 border-brand-100 shadow-sm mt-6">
                <div className="mb-6">
                  <span className="text-sm font-medium text-brand-600 mb-2 block tracking-wider uppercase">Question</span>
                  <h3 className="text-xl sm:text-2xl font-medium text-slate-800">
                    {currentResult.flashcards[index].front}
                  </h3>
                </div>
                
                {flipped ? (
                  <div className="pt-6 border-t border-slate-100">
                    <span className="text-sm font-medium text-brand-600 mb-2 block tracking-wider uppercase">Answer</span>
                    <p className="text-lg sm:text-xl text-slate-700">
                      {currentResult.flashcards[index].back}
                    </p>
                  </div>
                ) : (
                  <button 
                    onClick={() => setFlipped(true)}
                    className="w-full py-3 bg-brand-50 hover:bg-brand-100 text-brand-700 font-medium rounded-md transition-colors mt-4"
                  >
                    Show Answer
                  </button>
                )}
              </div>

              <div className="flex justify-between items-center mt-6">
                <button
                  onClick={prevCard}
                  disabled={index === 0}
                  className="px-5 py-2.5 rounded-md border border-slate-200 text-slate-600 disabled:opacity-50 hover:bg-slate-50 font-medium"
                >
                  Previous
                </button>
                <button
                  onClick={nextCard}
                  disabled={index === currentResult.flashcards.length - 1}
                  className="px-5 py-2.5 rounded-md border border-slate-200 text-slate-600 disabled:opacity-50 hover:bg-slate-50 font-medium"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {view === "history" && (
        <div className="space-y-4 mt-4">
          <Notice type="error" text={error} />
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-800">Flashcard History</h2>
            <button onClick={() => setView("setup")} className="text-sm font-medium text-brand-700 hover:underline">
              Back to Start
            </button>
          </div>
          
          {history.length === 0 ? (
            <div className="card p-8 text-center text-slate-500">
              <p>No flashcard history yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((attempt, i) => (
                <div key={i} className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-medium text-slate-800">{attempt.documentName}</h3>
                    <div className="text-sm text-slate-500 space-x-2 mt-1">
                      <span>{attempt.cardCount} Flashcards</span>
                      <span>•</span>
                      <span>{new Date(attempt.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => { setCurrentResult(attempt); setIndex(0); setFlipped(false); setView("flashcards"); }}
                    className="bg-brand-50 border border-brand-200 text-brand-700 px-3 py-1.5 rounded-md text-sm hover:bg-brand-100 transition-colors whitespace-nowrap"
                  >
                    View
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
