"use client";

import { useState } from "react";
import DocumentSelect from "@/components/DocumentSelect";
import Notice from "@/components/Notice";
import {
  BrainCircuit,
  History,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  PlusCircle,
  ArrowRight,
  Loader2,
  Award,
  BookOpen,
  Download,
} from "lucide-react";

type Note = { id: string; filename: string };
type Question = { question: string; options: string[]; answer: number; explanation?: string };
type QuizAttempt = {
  _id?: string;
  documentId: string;
  documentName: string;
  questionCount: number;
  score: number;
  correctCount: number;
  wrongCount: number;
  questions: {
    question: string;
    options: string[];
    correctAnswer: number;
    selectedAnswer: number;
    explanation?: string;
  }[];
  createdAt: string;
};

const countOptions = [3, 5, 10];

export default function QuizForm({ initialNotes }: { initialNotes: Note[] }) {
  const [view, setView] = useState<"setup" | "quiz" | "result" | "history">("setup");
  const [documentId, setDocumentId] = useState(initialNotes[0]?.id || "");
  const [questionCount, setQuestionCount] = useState(5);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);

  const [currentResult, setCurrentResult] = useState<QuizAttempt | null>(null);
  const [history, setHistory] = useState<QuizAttempt[]>([]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function generate() {
    if (loading || !documentId) return;
    setError("");
    setLoading(true);
    setQuestions([]);
    setIndex(0);
    setSelected(null);
    setSelectedAnswers([]);

    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId, count: questionCount }),
      });
      const data = await response.json();
      setLoading(false);

      if (!response.ok) {
        setError(data.error || "Could not generate a quiz.");
        return;
      }

      setQuestions(data.questions || []);
      setView("quiz");
    } catch {
      setLoading(false);
      setError("Network error. Please try again.");
    }
  }

  async function loadHistory() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/quiz/history");
      const data = await response.json();
      if (response.ok) {
        setHistory(data.attempts || []);
        setView("history");
      } else {
        setError(data.error || "Could not load history.");
      }
    } catch {
      setError("Network error loading history.");
    }
    setLoading(false);
  }

  async function finishQuiz(finalAnswers: number[]) {
    setLoading(true);
    let correct = 0;
    let wrong = 0;

    const formattedQuestions = questions.map((q, i) => {
      const sel = finalAnswers[i];
      if (sel === q.answer) correct++;
      else wrong++;

      return {
        question: q.question,
        options: q.options,
        correctAnswer: q.answer,
        selectedAnswer: sel,
        explanation: q.explanation,
      };
    });

    const docName =
      initialNotes.find((n) => n.id === documentId)?.filename || "Unknown Document";

    const attemptData = {
      documentId,
      documentName: docName,
      questionCount: questions.length,
      score: correct,
      correctCount: correct,
      wrongCount: wrong,
      questions: formattedQuestions,
    };

    try {
      const historyRes = await fetch("/api/quiz/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(attemptData),
      });
      const historyData = await historyRes.json();

      setCurrentResult({
        ...attemptData,
        createdAt: new Date().toISOString(),
        _id: historyRes.ok ? historyData.attemptId : undefined,
      });
    } catch {
      setCurrentResult({ ...attemptData, createdAt: new Date().toISOString() });
    }

    setLoading(false);
    setView("result");
  }

  function handleSelectOption(optionIndex: number) {
    setSelected(optionIndex);
  }

  function handleNext() {
    if (selected === null) return;
    const nextAnswers = [...selectedAnswers, selected];
    setSelectedAnswers(nextAnswers);

    if (index + 1 < questions.length) {
      setIndex(index + 1);
      setSelected(null);
    } else {
      finishQuiz(nextAnswers);
    }
  }

  const currentQ = questions[index];
  const progressPercent = questions.length > 0 ? ((index + 1) / questions.length) * 100 : 0;

  return (
    <div className="space-y-6">
      <Notice type="error" text={error} />

      {/* SETUP VIEW */}
      {view === "setup" && (
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-card space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-cyan-50 border border-cyan-200/60 text-cyan-700 flex items-center justify-center font-bold">
                <BrainCircuit className="w-5 h-5 text-cyan-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Quiz Practice Setup</h2>
                <p className="text-xs text-slate-500">Generate multiple-choice tests from notes</p>
              </div>
            </div>

            <button
              type="button"
              onClick={loadHistory}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-brand-700 hover:bg-slate-100 transition-colors"
            >
              <History className="w-3.5 h-3.5" />
              <span>Past Attempts</span>
            </button>
          </div>

          <DocumentSelect notes={initialNotes} value={documentId} onChange={setDocumentId} />

          {/* Question Count Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Number of Questions
            </label>
            <div className="grid grid-cols-3 gap-3">
              {countOptions.map((count) => {
                const isSelected = questionCount === count;
                return (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setQuestionCount(count)}
                    className={`rounded-2xl border p-3.5 text-center transition-all cursor-pointer ${
                      isSelected
                        ? "border-cyan-500 bg-cyan-50/50 shadow-xs ring-2 ring-cyan-500/20 font-bold text-cyan-800"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <p className="text-sm font-extrabold">{count} Questions</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {count === 3 ? "Rapid Check" : count === 5 ? "Standard" : "Full Exam"}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={generate}
            disabled={loading || !documentId}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl py-3 px-6 text-sm font-bold text-white bg-gradient-to-r from-cyan-600 via-teal-600 to-brand-600 hover:from-cyan-700 hover:to-brand-700 shadow-md shadow-cyan-500/25 hover:shadow-lg hover:shadow-cyan-500/35 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating Questions from Notes...</span>
              </>
            ) : (
              <>
                <BrainCircuit className="w-4 h-4" />
                <span>Start Practice Quiz</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}

      {/* QUIZ INTERACTION VIEW */}
      {view === "quiz" && currentQ && (
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-9 shadow-card space-y-6">
          {/* Progress Bar & Header */}
          <div className="space-y-2 pb-4 border-b border-slate-100">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span className="text-brand-700">
                Question {index + 1} of {questions.length}
              </span>
              <span>{Math.round(progressPercent)}% Completed</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-600 to-cyan-500 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 uppercase tracking-wider">
              Multiple Choice
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {currentQ.question}
            </h2>
          </div>

          {/* Options List */}
          <div className="space-y-2.5">
            {currentQ.options.map((opt, optIdx) => {
              const letter = String.fromCharCode(65 + optIdx);
              const isSelected = selected === optIdx;

              return (
                <button
                  key={optIdx}
                  type="button"
                  onClick={() => handleSelectOption(optIdx)}
                  className={`w-full flex items-center gap-3.5 p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "border-brand-500 bg-brand-50/60 shadow-sm ring-2 ring-brand-500/20 text-slate-900 font-semibold"
                      : "border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                      isSelected
                        ? "bg-brand-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {letter}
                  </div>
                  <span className="text-sm leading-relaxed">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Next / Submit Button */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Quit current quiz and return to setup?")) setView("setup");
              }}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600"
            >
              Quit Quiz
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={selected === null || loading}
              className="inline-flex items-center gap-2 rounded-xl py-2.5 px-6 text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-700 hover:to-emerald-700 shadow-md shadow-brand-500/25 transition-all disabled:opacity-40 disabled:pointer-events-none"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Grading Quiz...</span>
                </>
              ) : index + 1 === questions.length ? (
                <>
                  <span>Submit Final Answers</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Next Question</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* RESULT VIEW */}
      {view === "result" && currentResult && (
        <div className="space-y-6">
          {/* Print Only Header */}
          <div className="hidden print:block mb-6 border-b pb-4">
            <h1 className="text-3xl font-bold text-slate-900">StudyMate</h1>
            <h2 className="text-xl text-slate-600 mt-1">Quiz Score Report</h2>
            <div className="mt-4 text-xs text-slate-500 space-y-1">
              <p>
                <span className="font-semibold text-slate-700">Document:</span>{" "}
                {currentResult.documentName}
              </p>
              <p>
                <span className="font-semibold text-slate-700">Final Score:</span>{" "}
                {currentResult.score} / {currentResult.questionCount} (
                {Math.round((currentResult.score / currentResult.questionCount) * 100)}%)
              </p>
              <p>
                <span className="font-semibold text-slate-700">Performance:</span>{" "}
                {currentResult.correctCount} Correct, {currentResult.wrongCount} Incorrect
              </p>
              <p>
                <span className="font-semibold text-slate-700">Date:</span>{" "}
                {new Date(currentResult.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Score Header Card */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-card flex flex-col sm:flex-row items-center justify-between gap-6 print:border-none print:shadow-none print:p-0">
            <div className="space-y-2 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200/60 uppercase print:hidden">
                <Award className="w-3.5 h-3.5" />
                Quiz Completed
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                {currentResult.score / currentResult.questionCount >= 0.7
                  ? "Great job! Strong Comprehension"
                  : "Good Effort! Review Key Topics"}
              </h2>
              <p className="text-xs text-slate-500">
                Material:{" "}
                <span className="font-semibold text-slate-700">{currentResult.documentName}</span>
              </p>
            </div>

            {/* Score Ring Display */}
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-brand-600 to-cyan-500 text-white flex flex-col items-center justify-center shadow-lg shadow-brand-500/20 print:bg-slate-100 print:text-slate-900 print:shadow-none print:border print:border-slate-300">
                <span className="text-2xl font-black">
                  {currentResult.score}/{currentResult.questionCount}
                </span>
                <span className="text-[11px] font-semibold opacity-90">
                  {Math.round((currentResult.score / currentResult.questionCount) * 100)}%
                </span>
              </div>
              <div className="text-xs space-y-1 text-slate-600 font-semibold">
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{currentResult.correctCount} Correct</span>
                </div>
                <div className="flex items-center gap-1.5 text-rose-700">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>{currentResult.wrongCount} Incorrect</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex flex-wrap items-center gap-3 print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-800 bg-white border border-slate-200/90 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-xs"
              title="Download Quiz Result as PDF (Ctrl + P)"
            >
              <Download className="w-3.5 h-3.5 text-brand-600" />
              <span>Download Quiz Result (PDF)</span>
            </button>
            <button
              type="button"
              onClick={() => setView("setup")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Take Another Quiz</span>
            </button>
            <button
              type="button"
              onClick={loadHistory}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all"
            >
              <History className="w-3.5 h-3.5 text-slate-400" />
              <span>View Quiz History</span>
            </button>
          </div>

          {/* Question by Question Review */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Detailed Question Review
            </h3>

            {currentResult.questions.map((q, qIdx) => {
              const isCorrect = q.selectedAnswer === q.correctAnswer;
              return (
                <div
                  key={qIdx}
                  className={`rounded-2xl border p-5 space-y-3 bg-white shadow-xs print-break-inside-avoid ${
                    isCorrect ? "border-emerald-200/80" : "border-rose-200/80"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-xs font-bold text-slate-400">
                      Question {qIdx + 1}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        isCorrect
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          Correct
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" />
                          Incorrect
                        </>
                      )}
                    </span>
                  </div>

                  <p className="text-sm font-bold text-slate-800">{q.question}</p>

                  <div className="grid sm:grid-cols-2 gap-2 text-xs">
                    {q.options.map((opt, optI) => {
                      const isUserChoice = q.selectedAnswer === optI;
                      const isRightChoice = q.correctAnswer === optI;

                      let badgeClass = "border-slate-200 bg-slate-50/50 text-slate-600";
                      if (isRightChoice) {
                        badgeClass = "border-emerald-300 bg-emerald-50 text-emerald-800 font-bold";
                      } else if (isUserChoice && !isCorrect) {
                        badgeClass =
                          "border-rose-300 bg-rose-50 text-rose-800 font-bold line-through";
                      }

                      return (
                        <div
                          key={optI}
                          className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${badgeClass}`}
                        >
                          <span className="truncate">{opt}</span>
                          {isRightChoice && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          )}
                          {isUserChoice && !isRightChoice && (
                            <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-600 flex items-start gap-2">
                      <HelpCircle className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-800">Concept Explanation: </span>
                        <span>{q.explanation}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* HISTORY VIEW */}
      {view === "history" && (
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-card space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Quiz History</h2>
              <p className="text-xs text-slate-500">Review your past practice tests and scores</p>
            </div>
            <button
              type="button"
              onClick={() => setView("setup")}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 hover:text-brand-800"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>New Quiz</span>
            </button>
          </div>

          {history.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No quiz attempts yet</p>
              <p className="text-xs text-slate-400">
                Complete a practice quiz to view score history here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {history.map((attempt, i) => (
                <div
                  key={attempt._id || i}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:bg-slate-50/70 p-2 rounded-2xl transition-colors"
                >
                  <div className="space-y-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate group-hover:text-brand-700 transition-colors">
                      {attempt.documentName}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {attempt.questionCount} Questions
                      </span>
                      <span>•</span>
                      <span>{new Date(attempt.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <div className="text-right">
                      <span className="text-sm font-black text-slate-900">
                        {attempt.score}/{attempt.questionCount}
                      </span>
                      <span className="text-[11px] text-slate-400 ml-1">
                        ({Math.round((attempt.score / attempt.questionCount) * 100)}%)
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setCurrentResult(attempt);
                        setView("result");
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shadow-xs"
                    >
                      <span>Review</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
