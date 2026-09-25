"use client";

import { useState } from "react";
import DocumentSelect from "@/components/DocumentSelect";
import Notice from "@/components/Notice";

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

      setQuestions(data.questions);
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
        explanation: q.explanation
      };
    });
    
    const docName = initialNotes.find(n => n.id === documentId)?.filename || "Unknown Document";
    
    const attemptData = {
      documentId,
      documentName: docName,
      questionCount: questions.length,
      score: correct,
      correctCount: correct,
      wrongCount: wrong,
      questions: formattedQuestions
    };
    
    try {
      const response = await fetch("/api/quiz/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(attemptData)
      });
      const data = await response.json();
      if (response.ok) {
        setCurrentResult({ ...attemptData, createdAt: new Date().toISOString(), _id: data.attemptId });
        setView("result");
      } else {
        setError(data.error || "Failed to save quiz result.");
        setCurrentResult({ ...attemptData, createdAt: new Date().toISOString() });
        setView("result");
      }
    } catch {
      setError("Network error saving result.");
      setCurrentResult({ ...attemptData, createdAt: new Date().toISOString() });
      setView("result");
    }
    setLoading(false);
  }

  function next() {
    if (selected === null) return;
    
    const newAnswers = [...selectedAnswers, selected];
    setSelectedAnswers(newAnswers);
    
    if (index + 1 >= questions.length) {
      finishQuiz(newAnswers);
      return;
    }
    
    setIndex((value) => value + 1);
    setSelected(null);
  }

  function downloadResult() {
    window.print();
  }

  return (
    <>
      {view === "setup" && (
        <div className="card p-5 space-y-4">
          <Notice type="error" text={error} />
          
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-800">Start a new Quiz</h2>
            <button onClick={loadHistory} disabled={loading} className="text-sm font-medium text-brand-700 hover:underline">
              Quiz History
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Selected document</label>
            <DocumentSelect notes={initialNotes} value={documentId} onChange={setDocumentId} />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Number of Questions</label>
            <select
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
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
            {loading ? "Generating Quiz..." : "Generate Quiz"}
          </button>
        </div>
      )}

      {view === "quiz" && questions[index] && (
        <section className="card p-5 space-y-4 mt-6">
          <p className="text-sm text-slate-500">
            Question {index + 1} of {questions.length}
          </p>
          <h2 className="text-lg font-semibold text-slate-800">{questions[index].question}</h2>
          <div className="space-y-2">
            {questions[index].options.map((option, optionIndex) => (
              <label
                key={optionIndex}
                className={`block border rounded-md px-3 py-2 text-sm cursor-pointer transition-colors ${
                  selected === optionIndex
                    ? "border-brand-700 bg-brand-50"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  className="mr-2"
                  checked={selected === optionIndex}
                  onChange={() => setSelected(optionIndex)}
                />
                {option}
              </label>
            ))}
          </div>
          <button
            type="button"
            onClick={next}
            disabled={selected === null || loading}
            className="bg-brand-700 text-white px-4 py-2 rounded-md disabled:opacity-60"
          >
            {loading ? "Saving..." : (index + 1 === questions.length ? "Finish Quiz" : "Next")}
          </button>
        </section>
      )}

      {view === "result" && currentResult && (
        <div className="space-y-6 mt-4">
          <div className="card p-5 space-y-4 print:border-none print:shadow-none print:p-0">
            {/* Print Only Header */}
            <div className="hidden print:block mb-6 border-b pb-4">
              <h1 className="text-3xl font-bold text-slate-800">StudyMate</h1>
              <h2 className="text-xl text-slate-600 mt-1">AI Quiz Result</h2>
              <div className="mt-4 text-sm text-slate-500 space-y-1">
                <p><span className="font-semibold text-slate-700">Document:</span> {currentResult.documentName}</p>
                <p><span className="font-semibold text-slate-700">Date:</span> {new Date(currentResult.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <h2 className="text-xl font-bold text-slate-800 print:hidden">Quiz Complete</h2>
            <div className="flex gap-4 items-center">
              <div className="text-2xl font-bold text-brand-700">
                Score: {currentResult.score} / {currentResult.questionCount}
              </div>
              <div className="text-sm text-slate-500">
                <span className="text-green-600 font-medium print:text-green-800">Correct: {currentResult.correctCount}</span>
                <span className="mx-2">|</span>
                <span className="text-red-600 font-medium print:text-red-800">Wrong: {currentResult.wrongCount}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2 print:hidden">
              <button onClick={() => setView("setup")} className="bg-brand-700 text-white px-4 py-2 rounded-md text-sm transition-colors">
                Reattempt Quiz
              </button>
              <button onClick={() => downloadResult()} className="border border-brand-700 text-brand-700 px-4 py-2 rounded-md text-sm hover:bg-brand-50 transition-colors">
                Download PDF
              </button>
              <button onClick={loadHistory} className="border border-slate-300 text-slate-700 px-4 py-2 rounded-md text-sm hover:bg-slate-50 transition-colors">
                Quiz History
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 print:hidden">Question Review</h3>
            {currentResult.questions.map((q, i) => {
              const isCorrect = q.selectedAnswer === q.correctAnswer;
              return (
                <div key={i} className={`card p-5 border-l-4 ${isCorrect ? "border-l-green-500 print:border-l-green-600" : "border-l-red-500 print:border-l-red-600"} print-break-inside-avoid print:border-t print:border-r print:border-b print:shadow-none`}>
                  <h4 className="font-medium text-slate-800 mb-3">
                    Question {i + 1}: {q.question}
                  </h4>
                  
                  <div className="space-y-2 text-sm">
                    <div className="p-3 bg-slate-50 rounded-md">
                      <p className="text-slate-500 text-xs mb-1">Your answer:</p>
                      <p className={isCorrect ? "text-slate-800" : "text-red-600"}>{q.options[q.selectedAnswer]}</p>
                    </div>
                    
                    {!isCorrect && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                        <p className="text-green-700 text-xs mb-1">Correct answer:</p>
                        <p className="text-green-900 font-medium">{q.options[q.correctAnswer]}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 flex items-start gap-2">
                    <div className={`font-bold ${isCorrect ? "text-green-600" : "text-red-600"}`}>
                      {isCorrect ? "✓ Correct" : "✗ Wrong"}
                    </div>
                  </div>
                  
                  {!isCorrect && q.explanation && (
                    <div className="mt-3 text-sm text-slate-600 italic">
                      <span className="font-medium">Why: </span>{q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view === "history" && (
        <div className="space-y-4 mt-4">
          <Notice type="error" text={error} />
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-800">Quiz History</h2>
            <button onClick={() => setView("setup")} className="text-sm font-medium text-brand-700 hover:underline">
              Back to Start
            </button>
          </div>
          
          {history.length === 0 ? (
            <div className="card p-8 text-center text-slate-500">
              <p>No quiz attempts yet.</p>
              <p className="text-sm mt-1">Complete a quiz to see your history here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((attempt, i) => (
                <div key={i} className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-medium text-slate-800">{attempt.documentName}</h3>
                    <div className="text-sm text-slate-500 space-x-2 mt-1">
                      <span>{attempt.questionCount} Questions</span>
                      <span>•</span>
                      <span>{new Date(attempt.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-lg font-bold text-brand-700">Score: {attempt.score} / {attempt.questionCount}</div>
                      <div className="text-xs text-slate-500">{Math.round((attempt.score / attempt.questionCount) * 100)}%</div>
                    </div>
                    <button 
                      onClick={() => { setCurrentResult(attempt); setView("result"); }}
                      className="bg-brand-50 border border-brand-200 text-brand-700 px-3 py-1.5 rounded-md text-sm hover:bg-brand-100 transition-colors"
                    >
                      View Result
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
