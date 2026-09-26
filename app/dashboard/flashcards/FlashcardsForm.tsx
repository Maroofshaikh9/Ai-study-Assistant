"use client";

import { useState } from "react";
import DocumentSelect from "@/components/DocumentSelect";
import Notice from "@/components/Notice";
import {
  Layers,
  History,
  RotateCw,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  Printer,
  Sparkles,
  Loader2,
  Calendar,
  CheckCircle2,
  BookOpen,
} from "lucide-react";

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

      // /api/flashcards returns { cards: [...] }
      const cards: Card[] = Array.isArray(data.cards)
        ? data.cards
        : Array.isArray(data.flashcards)
        ? data.flashcards
        : [];

      if (cards.length === 0) {
        setLoading(false);
        setError("No flashcards were generated. Please try again with a different document or count.");
        return;
      }

      const docName = initialNotes.find((n) => n.id === documentId)?.filename || "Notes";
      const attemptData: FlashcardAttempt = {
        documentId,
        documentName: docName,
        cardCount: cards.length,
        flashcards: cards,
        createdAt: new Date().toISOString(),
      };

      // Persist to database history via /api/flashcards/history
      try {
        const histRes = await fetch("/api/flashcards/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            documentId,
            documentName: docName,
            cardCount: cards.length,
            flashcards: cards,
          }),
        });
        const histData = await histRes.json();
        if (histData.historyId) {
          attemptData._id = histData.historyId;
        }
      } catch {
        // Background history save failure ignored
      }

      setCurrentResult(attemptData);
      setView("flashcards");
    } catch {
      setError("An unexpected network error occurred while generating flashcards.");
    } finally {
      setLoading(false);
    }
  }

  async function loadHistory() {
    setError("");
    try {
      const res = await fetch("/api/flashcards/history");
      const data = await res.json();
      if (res.ok) {
        setHistory(data.history || data.flashcards || []);
        setView("history");
      } else {
        setError(data.error || "Failed to load flashcard history.");
      }
    } catch {
      setError("An error occurred while fetching flashcard history.");
    }
  }

  function nextCard() {
    if (!currentResult) return;
    const cards = currentResult.flashcards || [];
    if (index < cards.length - 1) {
      setFlipped(false);
      setIndex((prev) => prev + 1);
    }
  }

  function prevCard() {
    if (!currentResult) return;
    if (index > 0) {
      setFlipped(false);
      setIndex((prev) => prev - 1);
    }
  }

  function shuffleCards() {
    if (!currentResult) return;
    const cards = [...(currentResult.flashcards || [])];
    if (cards.length === 0) return;
    const shuffled = cards.sort(() => Math.random() - 0.5);
    setCurrentResult({
      ...currentResult,
      flashcards: shuffled,
    });
    setIndex(0);
    setFlipped(false);
  }

  const activeCards = currentResult?.flashcards || [];
  const currentCard = activeCards[index] || { front: "", back: "" };
  const totalCards = activeCards.length;

  return (
    <>
      <Notice type="error" text={error} />

      {view === "setup" && (
        <div className="card p-6 sm:p-8 space-y-6 bg-white shadow-card border border-slate-200/80 rounded-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Configure Study Deck</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Select your source material and desired number of flashcards.
              </p>
            </div>
            <button
              type="button"
              onClick={loadHistory}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors self-start sm:self-auto"
            >
              <History className="w-4 h-4 text-slate-500" />
              Past Flashcards
            </button>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-800">
              Source Lecture Note / Textbook
            </label>
            <DocumentSelect notes={initialNotes} value={documentId} onChange={setDocumentId} />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-800">
              Deck Size (Cards)
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
              {[5, 10, 15, 20, 25, 30].map((num) => {
                const isSelected = cardCount === num;
                return (
                  <button
                    key={num}
                    type="button"
                    disabled={loading}
                    onClick={() => setCardCount(num)}
                    className={`py-3 px-2 rounded-xl text-center font-bold text-sm transition-all border ${
                      isSelected
                        ? "bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-500/20"
                        : "bg-white text-slate-700 border-slate-200 hover:border-brand-300 hover:bg-slate-50"
                    }`}
                  >
                    {num} Cards
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={generate}
            disabled={loading || !documentId}
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-brand-600 to-teal-600 hover:from-brand-700 hover:to-teal-700 shadow-lg shadow-brand-600/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Synthesizing Flashcards with AI...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Flashcards ({cardCount} Cards)
              </>
            )}
          </button>
        </div>
      )}

      {view === "flashcards" && currentResult && (
        <section className="space-y-6">
          {/* Print Only Layout */}
          <div className="hidden print:block mb-6 border-b pb-4">
            <h1 className="text-3xl font-bold text-slate-900">StudyMate</h1>
            <h2 className="text-xl text-slate-600 mt-1">AI Flashcards</h2>
            <div className="mt-4 text-sm text-slate-500 space-y-1">
              <p>
                <span className="font-semibold text-slate-700">Document:</span>{" "}
                {currentResult.documentName}
              </p>
              <p>
                <span className="font-semibold text-slate-700">Number of Flashcards:</span>{" "}
                {totalCards}
              </p>
              <p>
                <span className="font-semibold text-slate-700">Date:</span>{" "}
                {new Date(currentResult.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="mt-6 space-y-4">
              {activeCards.map((card, i) => (
                <div key={i} className="print-break-inside-avoid border p-4 rounded-xl">
                  <h3 className="font-bold text-slate-800 mb-2">Card {i + 1}</h3>
                  <div className="mb-2">
                    <p className="text-xs uppercase font-semibold text-slate-500">Question:</p>
                    <p className="text-slate-900 font-medium">{card.front}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase font-semibold text-slate-500">Answer:</p>
                    <p className="text-slate-700">{card.back}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Screen Layout */}
          <div className="print:hidden space-y-6">
            {/* Header controls bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200/60 flex items-center justify-center text-cyan-700 font-bold text-sm">
                  {totalCards > 0 ? `${index + 1}/${totalCards}` : "0/0"}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 line-clamp-1">
                    {currentResult.documentName}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Card {totalCards > 0 ? index + 1 : 0} of {totalCards}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={shuffleCards}
                  disabled={totalCards <= 1}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-lg transition-colors"
                  title="Shuffle Cards"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  Shuffle
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / PDF
                </button>
                <button
                  type="button"
                  onClick={() => setView("setup")}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors"
                >
                  New Deck
                </button>
                <button
                  type="button"
                  onClick={loadHistory}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  History
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-brand-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: totalCards > 0 ? `${((index + 1) / totalCards) * 100}%` : "0%",
                }}
              />
            </div>

            {/* 3D Flip Card Container */}
            <div
              className="perspective-1000 w-full min-h-[340px] sm:min-h-[380px] cursor-pointer select-none"
              onClick={() => setFlipped(!flipped)}
            >
              <div
                className={`relative w-full h-full min-h-[340px] sm:min-h-[380px] rounded-3xl transition-transform duration-500 transform-style-3d ${
                  flipped ? "rotate-y-180" : ""
                }`}
              >
                {/* Front Side: Question */}
                <div className="absolute inset-0 w-full h-full backface-hidden bg-white border-2 border-slate-200/90 rounded-3xl p-8 sm:p-12 flex flex-col justify-between shadow-xl shadow-slate-200/50 hover:border-brand-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-brand-50 text-brand-700 border border-brand-200/60">
                      <BookOpen className="w-3.5 h-3.5" />
                      Question #{index + 1}
                    </span>
                    <span className="text-xs font-medium text-slate-400">Click to flip</span>
                  </div>

                  <div className="my-auto py-6">
                    <p className="text-xl sm:text-2xl font-bold text-slate-900 leading-relaxed text-center">
                      {currentCard.front || "No front content"}
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-xs font-medium text-slate-400">
                    <RotateCw className="w-3.5 h-3.5 text-brand-600 animate-spin-slow" />
                    <span>Tap card to reveal answer</span>
                  </div>
                </div>

                {/* Back Side: Answer */}
                <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 text-white rounded-3xl p-8 sm:p-12 flex flex-col justify-between shadow-xl shadow-emerald-950/20 border-2 border-emerald-500/30">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Answer #{index + 1}
                    </span>
                    <span className="text-xs font-medium text-emerald-400/80">Click to flip back</span>
                  </div>

                  <div className="my-auto py-6">
                    <p className="text-lg sm:text-xl font-medium text-emerald-50 leading-relaxed text-center">
                      {currentCard.back || "No back content"}
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-xs font-medium text-emerald-400/60">
                    <RotateCw className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Tap card to return to question</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between gap-4 pt-2">
              <button
                type="button"
                onClick={prevCard}
                disabled={index === 0}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-slate-700 bg-white border border-slate-200/90 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <button
                type="button"
                onClick={() => setFlipped(!flipped)}
                className="px-6 py-3 rounded-xl font-bold text-sm text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200/80 transition-colors shadow-sm"
              >
                {flipped ? "Show Question" : "Reveal Answer"}
              </button>

              <button
                type="button"
                onClick={nextCard}
                disabled={index >= totalCards - 1}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      )}

      {view === "history" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Flashcard History</h2>
              <p className="text-sm text-slate-500">Previously generated study decks.</p>
            </div>
            <button
              type="button"
              onClick={() => setView("setup")}
              className="text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              Back to Deck Generator
            </button>
          </div>

          {history.length === 0 ? (
            <div className="card p-12 text-center bg-white rounded-2xl border border-slate-200/80">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-slate-700">No past flashcard decks</h3>
              <p className="text-sm text-slate-500 mt-1">
                Generate your first flashcard deck to review it anytime.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {history.map((attempt, i) => (
                <div
                  key={i}
                  className="card p-5 bg-white border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 transition-all"
                >
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-900 text-base">{attempt.documentName}</h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                        <Layers className="w-3.5 h-3.5 text-cyan-600" />
                        {attempt.cardCount || (attempt.flashcards || []).length} Flashcards
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(attempt.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentResult(attempt);
                      setIndex(0);
                      setFlipped(false);
                      setView("flashcards");
                    }}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 transition-colors whitespace-nowrap self-start sm:self-auto"
                  >
                    Study Deck
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
