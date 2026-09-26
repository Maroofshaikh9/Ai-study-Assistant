"use client";

import Link from "next/link";
import { FormEvent, useState, useRef } from "react";
import Notice from "@/components/Notice";
import { formatDate, formatSize } from "@/lib/format";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  FileText,
  Trash2,
  Sparkles,
  BrainCircuit,
  Layers,
  MessageSquareCode,
  Search,
  CheckCircle2,
  Loader2,
  FileCheck,
  X,
  Clock,
  HardDrive,
} from "lucide-react";

type Note = {
  id: string;
  filename: string;
  size: number;
  createdAt: string;
};

export default function NotesClient({ initialNotes }: { initialNotes: Note[] }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleUpload(event: FormEvent) {
    event.preventDefault();
    if (loading) return;

    if (!file) {
      setError("Please choose a PDF file to upload.");
      return;
    }

    const isPdf =
      file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setError("Only PDF files are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("PDF size must be 5 MB or smaller.");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    const form = new FormData();
    form.append("file", file);

    try {
      const response = await fetch("/api/documents", {
        method: "POST",
        body: form,
      });
      const data = await response.json();
      setLoading(false);

      if (!response.ok) {
        setError(data.error || "Upload failed. Please try again.");
        return;
      }

      setSuccess(data.message || "Document uploaded and parsed successfully!");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      router.refresh();
    } catch {
      setLoading(false);
      setError("Network error. Please check your connection and try again.");
    }
  }

  async function handleDelete(id: string, filename: string) {
    if (deleting) return;
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${filename}"? All associated AI summaries and quizzes will be unlinked.`
    );
    if (!confirmDelete) return;

    setDeleting(id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/documents/${id}`, { method: "DELETE" });
      const data = await response.json();
      setDeleting("");

      if (!response.ok) {
        setError(data.error || "Could not delete the note.");
        return;
      }

      setSuccess(data.message || "Document deleted.");
      router.refresh();
    } catch {
      setDeleting("");
      setError("Network error. Failed to delete document.");
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
      setError("");
    }
  };

  const filteredNotes = initialNotes.filter((note) =>
    note.filename.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Notice type="error" text={error} />
      <Notice type="success" text={success} />

      {/* Interactive Upload Box */}
      <form onSubmit={handleUpload} className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-card space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 border border-brand-200/60 text-brand-700 flex items-center justify-center font-bold">
              <UploadCloud className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Upload PDF Document</h2>
              <p className="text-xs text-slate-500">Max file size: 5 MB • Standard PDF format</p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200/60 hidden sm:inline-block">
            Groq LLaMA 3.1 Ready
          </span>
        </div>

        {/* Drag & Drop Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? "border-brand-500 bg-brand-50/50 scale-[0.99]"
              : file
              ? "border-emerald-300 bg-emerald-50/30"
              : "border-slate-300/80 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-400"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={(event) => {
              setFile(event.target.files?.[0] || null);
              setError("");
            }}
          />

          {file ? (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-left">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <FileCheck className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900 truncate">{file.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{formatSize(file.size)} • PDF Ready to Upload</p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                title="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center mx-auto shadow-xs">
                <UploadCloud className="w-6 h-6 text-slate-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">
                  <span className="text-brand-600 hover:underline">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Lecture slides, book chapters, syllabus handouts (up to 5MB)
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-slate-600 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Plaintext encrypted, native pdf-parse extraction
          </p>

          <button
            type="submit"
            disabled={loading || !file}
            className="inline-flex items-center justify-center gap-2 rounded-xl py-2.5 px-6 text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-700 hover:to-emerald-700 shadow-md shadow-brand-500/25 hover:shadow-lg hover:shadow-brand-500/35 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing PDF...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                <span>Upload Document</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Document Library Section */}
      <section className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-card space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Your Document Library</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {initialNotes.length} {initialNotes.length === 1 ? "document" : "documents"} available for AI processing
            </p>
          </div>

          {/* Search bar */}
          {initialNotes.length > 0 && (
            <div className="relative w-full sm:w-64">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                placeholder="Search notes by name..."
                className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder:text-slate-400 shadow-xs focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}
        </div>

        {initialNotes.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 border border-slate-200 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">No study notes uploaded yet</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Use the upload box above to add your first lecture PDF.
              </p>
            </div>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No notes match your search term &quot;{search}&quot;.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-slate-50/70 p-2 rounded-2xl transition-colors"
              >
                {/* Note Info */}
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 border border-red-200/60 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                    PDF
                  </div>
                  <div className="min-w-0 space-y-1">
                    <p className="text-sm font-bold text-slate-800 truncate group-hover:text-brand-700 transition-colors">
                      {note.filename}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <HardDrive className="w-3 h-3" />
                        {formatSize(note.size)}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(note.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick AI Study Tool Actions */}
                <div className="flex flex-wrap items-center gap-2 self-end md:self-center">
                  <Link
                    href={`/dashboard/summary?doc=${note.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200/60 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Summary</span>
                  </Link>
                  <Link
                    href={`/dashboard/quiz?doc=${note.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-cyan-700 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200/60 transition-colors"
                  >
                    <BrainCircuit className="w-3.5 h-3.5" />
                    <span>Quiz</span>
                  </Link>
                  <Link
                    href={`/dashboard/flashcards?doc=${note.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200/60 transition-colors"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Cards</span>
                  </Link>
                  <Link
                    href={`/dashboard/chat?doc=${note.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/60 transition-colors"
                  >
                    <MessageSquareCode className="w-3.5 h-3.5" />
                    <span>Chat</span>
                  </Link>

                  <button
                    type="button"
                    disabled={deleting === note.id}
                    onClick={() => handleDelete(note.id, note.filename)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50 ml-1"
                    title="Delete document"
                  >
                    {deleting === note.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
