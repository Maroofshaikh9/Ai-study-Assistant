"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import DocumentSelect from "@/components/DocumentSelect";
import Notice from "@/components/Notice";
import {
  MessageSquareCode,
  History,
  Send,
  Loader2,
  Sparkles,
  Bot,
  User,
  PlusCircle,
  Printer,
  Calendar,
  Clock,
  ArrowRight,
} from "lucide-react";

type Note = { id: string; filename: string };
type Message = { role: "user" | "assistant"; content: string };
type ChatHistory = {
  _id: string;
  documentId: string;
  documentName: string;
  messages: Message[];
  updatedAt: string;
};

export default function ChatForm({ initialNotes }: { initialNotes: Note[] }) {
  const [view, setView] = useState<"chat" | "history">("chat");
  const [documentId, setDocumentId] = useState(initialNotes[0]?.id || "");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);

  const [historyList, setHistoryList] = useState<ChatHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  async function saveHistory(currentMessages: Message[], activeChatId: string | null) {
    try {
      const res = await fetch("/api/chat/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: activeChatId,
          documentId,
          messages: currentMessages,
        }),
      });
      const data = await res.json();
      if (res.ok && data.chatId) {
        setChatId(data.chatId);
        return data.chatId;
      }
    } catch {
      // Background save error ignored intentionally
    }
    return activeChatId;
  }

  async function send(event: FormEvent, promptOverride?: string) {
    if (event) event.preventDefault();
    const queryToSend = promptOverride || question;
    if (loading || !documentId || !queryToSend.trim()) return;

    setError("");
    const userMessage: Message = { role: "user", content: queryToSend.trim() };
    const newMessages = [...messages, userMessage];

    const currentQuestion = queryToSend.trim();
    const currentHistory = [...messages];

    setQuestion("");
    setMessages(newMessages);
    setLoading(true);

    try {
      const activeChatId = await saveHistory(newMessages, chatId);

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId,
          question: currentQuestion,
          history: currentHistory,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setLoading(false);
        setError(data.error || "Could not answer the question.");
        return;
      }

      const finalMessages = [...newMessages, { role: "assistant" as const, content: data.answer }];
      setMessages(finalMessages);

      await saveHistory(finalMessages, activeChatId);

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
      const response = await fetch("/api/chat/history");
      const data = await response.json();
      if (response.ok) {
        setHistoryList(data.history || []);
        setView("history");
      } else {
        setError(data.error || "Could not load history.");
      }
    } catch {
      setError("Network error loading history.");
    }
    setLoading(false);
  }

  function startNewChat() {
    setMessages([]);
    setChatId(null);
    setError("");
    setView("chat");
  }

  function loadOldChat(chat: ChatHistory) {
    setDocumentId(chat.documentId);
    setMessages(chat.messages);
    setChatId(chat._id);
    setView("chat");
  }

  const currentDocName = initialNotes.find((n) => n.id === documentId)?.filename || "Unknown Document";

  const promptSuggestions = [
    "What are the most critical formulas and theorems here?",
    "Summarize the main argument in 3 clear bullet points.",
    "Can you provide a simple analogy to explain the core concept?",
    "What potential exam questions could be derived from this?",
  ];

  return (
    <>
      <Notice type="error" text={error} />

      {view === "chat" && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="card p-5 space-y-4 bg-white border border-slate-200/80 shadow-card rounded-2xl print:hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Study Session Setup</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Choose the source document to ground your AI tutor&apos;s responses.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {messages.length > 0 && (
                  <>
                    <button
                      type="button"
                      onClick={startNewChat}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      New Session
                    </button>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Print / PDF
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={loadHistory}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <History className="w-3.5 h-3.5" />
                  Past Sessions
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Source Document
              </label>
              <DocumentSelect
                notes={initialNotes}
                value={documentId}
                onChange={(id) => {
                  setDocumentId(id);
                  setMessages([]);
                  setChatId(null);
                  setError("");
                }}
              />
            </div>
          </div>

          {/* Print Only Header */}
          <div className="hidden print:block mb-6 border-b pb-4">
            <h1 className="text-3xl font-bold text-slate-900">StudyMate</h1>
            <h2 className="text-xl text-slate-600 mt-1">Study Chat Transcript</h2>
            <div className="mt-4 text-sm text-slate-500 space-y-1">
              <p>
                <span className="font-semibold text-slate-700">Document:</span> {currentDocName}
              </p>
              <p>
                <span className="font-semibold text-slate-700">Date:</span>{" "}
                {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Chat Window Container */}
          <section className="card bg-white border border-slate-200/80 shadow-card rounded-2xl flex flex-col min-h-[460px] overflow-hidden print:border-none print:shadow-none print:min-h-0">
            {/* Active Document Header */}
            <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between print:hidden">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-slate-700 truncate max-w-[280px] sm:max-w-md">
                  Active Context: <span className="text-brand-700 font-bold">{currentDocName}</span>
                </span>
              </div>
              <span className="text-xs text-slate-400 font-medium">Groq Llama 3 70B</span>
            </div>

            {/* Messages Scroll Area */}
            <div
              ref={scrollRef}
              className="flex-1 p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[520px] print:max-h-none print:overflow-visible print:p-0"
            >
              {messages.length === 0 ? (
                <div className="py-10 text-center space-y-6 print:hidden">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-100 to-teal-50 border border-brand-200/60 text-brand-700 mx-auto flex items-center justify-center shadow-sm">
                    <Sparkles className="w-7 h-7 text-brand-600" />
                  </div>
                  <div className="max-w-md mx-auto space-y-1.5">
                    <h3 className="font-bold text-slate-900 text-lg">
                      Ready to tutor you on this note
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      Ask any question about formulas, definitions, or complex arguments. Your AI tutor will answer with precise references to your document.
                    </p>
                  </div>

                  {/* Prompt Suggestions */}
                  <div className="max-w-xl mx-auto pt-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                      Suggested Questions
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                      {promptSuggestions.map((prompt, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={(e) => send(e, prompt)}
                          className="p-3 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-brand-50 hover:text-brand-900 hover:border-brand-200 border border-slate-200/80 rounded-xl transition-all flex items-start gap-2 group"
                        >
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600 mt-0.5 shrink-0" />
                          <span>{prompt}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                messages.map((message, idx) => (
                  <div
                    key={`${message.role}-${idx}`}
                    className={`flex gap-3 print-break-inside-avoid ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-xl bg-brand-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-brand-500/20 mt-1">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 sm:p-5 text-sm leading-relaxed ${
                        message.role === "user"
                          ? "bg-slate-900 text-white rounded-tr-sm shadow-md"
                          : "bg-slate-50 text-slate-800 border border-slate-200/80 rounded-tl-sm shadow-sm"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span
                          className={`text-xs font-bold uppercase tracking-wider ${
                            message.role === "user" ? "text-slate-300" : "text-brand-700"
                          }`}
                        >
                          {message.role === "user" ? "You" : "StudyMate Tutor"}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>

                    {message.role === "user" && (
                      <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-1">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))
              )}

              {loading && (
                <div className="flex items-start gap-3 print:hidden">
                  <div className="w-8 h-8 rounded-xl bg-brand-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-brand-500/20 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl rounded-tl-sm p-4 text-sm text-slate-600 flex items-center gap-3">
                    <Loader2 className="w-4 h-4 text-brand-600 animate-spin" />
                    <span>Analyzing document and drafting explanation...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => send(e)}
              className="p-3 sm:p-4 bg-slate-50/80 border-t border-slate-200/80 flex items-center gap-2 print:hidden"
            >
              <input
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder={
                  documentId
                    ? "Ask a doubt about this document (e.g., clarify section 3)..."
                    : "Select a document above first..."
                }
                disabled={loading || !documentId}
                className="flex-1 border border-slate-200 rounded-xl px-4 py-3 bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 disabled:bg-slate-100 transition-all"
              />
              <button
                type="submit"
                disabled={loading || !documentId || !question.trim()}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-brand-600/20 transition-all shrink-0"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">Ask AI</span>
                  </>
                )}
              </button>
            </form>
          </section>
        </div>
      )}

      {view === "history" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Chat Session History</h2>
              <p className="text-sm text-slate-500">Previously saved study dialogues.</p>
            </div>
            <button
              type="button"
              onClick={() => setView("chat")}
              className="text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              Back to Live Chat
            </button>
          </div>

          {historyList.length === 0 ? (
            <div className="card p-12 text-center bg-white rounded-2xl border border-slate-200/80">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
                <MessageSquareCode className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-slate-700">No chat history yet</h3>
              <p className="text-sm text-slate-500 mt-1">
                Conversations with your AI tutor will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {historyList.map((chat, i) => (
                <div
                  key={i}
                  className="card p-5 bg-white border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 transition-all"
                >
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-900 text-base">{chat.documentName}</h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                        <MessageSquareCode className="w-3.5 h-3.5 text-violet-600" />
                        {chat.messages.length} Messages
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(chat.updatedAt).toLocaleDateString()}
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(chat.updatedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => loadOldChat(chat)}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 transition-colors whitespace-nowrap self-start sm:self-auto"
                  >
                    Resume Chat
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
