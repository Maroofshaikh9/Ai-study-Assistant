"use client";

import { FormEvent, useState, useRef, useEffect } from "react";
import DocumentSelect from "@/components/DocumentSelect";
import Notice from "@/components/Notice";

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
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function saveHistory(updatedMessages: Message[], currentChatId: string | null) {
    try {
      const docName = initialNotes.find(n => n.id === documentId)?.filename || "Unknown Document";
      const res = await fetch("/api/chat/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: currentChatId,
          documentId,
          documentName: docName,
          messages: updatedMessages
        })
      });
      const data = await res.json();
      if (res.ok && data.chatId) {
        setChatId(data.chatId);
        return data.chatId;
      }
    } catch {
      // Ignore background save errors to not interrupt the chat experience
    }
    return currentChatId;
  }

  async function send(event: FormEvent) {
    event.preventDefault();
    if (loading || !question.trim() || !documentId) {
      return;
    }

    const currentQuestion = question.trim();
    const currentHistory = [...messages];
    
    setQuestion("");
    setError("");
    const newMessages = [...currentHistory, { role: "user" as const, content: currentQuestion }];
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
  
  const currentDocName = initialNotes.find(n => n.id === documentId)?.filename || "Unknown Document";

  return (
    <>
      {view === "chat" && (
        <>
          <div className="card p-5 space-y-4 print:hidden">
            <Notice type="error" text={error} />
            
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-slate-800">Study Chat</h2>
              <div className="flex gap-3">
                {messages.length > 0 && (
                  <>
                    <button onClick={startNewChat} className="text-sm font-medium text-brand-700 hover:underline">
                      New Chat
                    </button>
                    <button onClick={() => window.print()} className="text-sm font-medium text-brand-700 hover:underline">
                      Download PDF
                    </button>
                  </>
                )}
                <button onClick={loadHistory} disabled={loading} className="text-sm font-medium text-brand-700 hover:underline">
                  History
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Selected document</label>
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
            <h1 className="text-3xl font-bold text-slate-800">StudyMate</h1>
            <h2 className="text-xl text-slate-600 mt-1">Study Chat</h2>
            <div className="mt-4 text-sm text-slate-500 space-y-1">
              <p><span className="font-semibold text-slate-700">Document:</span> {currentDocName}</p>
              <p><span className="font-semibold text-slate-700">Date:</span> {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <section className="card min-h-[280px] flex flex-col mt-6 print:border-none print:shadow-none print:mt-0">
            <div ref={scrollRef} className="flex-1 p-5 space-y-3 overflow-y-auto max-h-[500px] print:max-h-none print:overflow-visible print:p-0">
              {messages.length === 0 ? (
                <p className="text-sm text-slate-500 print:hidden">No messages yet. Ask a question about your notes!</p>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={`rounded-md px-4 py-3 text-sm print-break-inside-avoid ${
                      message.role === "user"
                        ? "bg-brand-50 text-slate-800 print:bg-slate-100"
                        : "bg-slate-100 text-slate-700 print:bg-white print:border print:border-slate-200"
                    }`}
                  >
                    <p className="font-bold mb-1">
                      {message.role === "user" ? "You" : "StudyMate"}
                    </p>
                    <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  </div>
                ))
              )}
              {loading && <p className="text-sm text-slate-500 print:hidden animate-pulse">Thinking...</p>}
            </div>
            
            <form onSubmit={send} className="p-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3 bg-slate-50 rounded-b-lg print:hidden">
              <input
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Ask a question about the document..."
                className="flex-1 border border-slate-300 rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                type="submit"
                disabled={loading || !documentId || !question.trim()}
                className="bg-brand-700 text-white px-6 py-2.5 rounded-md disabled:opacity-60 transition-colors font-medium whitespace-nowrap"
              >
                {loading ? "Sending..." : "Send"}
              </button>
            </form>
          </section>
        </>
      )}

      {view === "history" && (
        <div className="space-y-4">
          <Notice type="error" text={error} />
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-800">Chat History</h2>
            <button onClick={() => setView("chat")} className="text-sm font-medium text-brand-700 hover:underline">
              Back to Chat
            </button>
          </div>
          
          {historyList.length === 0 ? (
            <div className="card p-8 text-center text-slate-500">
              <p>No chat history yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {historyList.map((chat, i) => (
                <div key={i} className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-medium text-slate-800">{chat.documentName}</h3>
                    <div className="text-sm text-slate-500 space-x-2 mt-1">
                      <span>{chat.messages.length} messages</span>
                      <span>•</span>
                      <span>{new Date(chat.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => loadOldChat(chat)}
                    className="bg-brand-50 border border-brand-200 text-brand-700 px-4 py-1.5 rounded-md text-sm hover:bg-brand-100 transition-colors whitespace-nowrap"
                  >
                    View Chat
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
