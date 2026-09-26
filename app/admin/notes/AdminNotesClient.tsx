"use client";

import { useState } from "react";
import Notice from "@/components/Notice";
import { formatDate, formatSize } from "@/lib/format";
import { useRouter } from "next/navigation";
import {
  Search,
  Trash2,
  Loader2,
  FileText,
  User,
  Calendar,
  HardDrive,
} from "lucide-react";

type NoteRow = {
  id: string;
  filename: string;
  size: number;
  createdAt: string;
  ownerName: string;
  ownerEmail: string;
};

export default function AdminNotesClient({ initialNotes }: { initialNotes: NoteRow[] }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleting, setDeleting] = useState("");
  const [query, setQuery] = useState("");

  const filtered = initialNotes.filter((n) => {
    const q = query.toLowerCase();
    return (
      n.filename.toLowerCase().includes(q) ||
      n.ownerName.toLowerCase().includes(q) ||
      n.ownerEmail.toLowerCase().includes(q)
    );
  });

  async function handleDelete(id: string, filename: string) {
    if (deleting) return;
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${filename}" from the repository?`
    );
    if (!confirmed) return;

    setDeleting(id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/admin/documents/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      setDeleting("");

      if (!response.ok) {
        setError(data.error || "Could not delete the note.");
        return;
      }

      setSuccess(data.message || "Document successfully removed.");
      router.refresh();
    } catch {
      setDeleting("");
      setError("An unexpected network error occurred while deleting the note.");
    }
  }

  return (
    <div className="space-y-6">
      <Notice type="error" text={error} />
      <Notice type="success" text={success} />

      {/* Search Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-card">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by filename or student owner..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
        </div>
        <div className="text-xs font-semibold text-slate-500 px-2">
          Showing <span className="text-slate-900 font-bold">{filtered.length}</span> of {initialNotes.length} documents
        </div>
      </div>

      {/* Table Container */}
      <section className="card bg-white border border-slate-200/80 rounded-2xl shadow-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <p className="font-semibold text-slate-700">No documents found</p>
            <p className="text-xs text-slate-400">Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[760px]">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-left text-slate-500 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Document</th>
                  <th className="px-6 py-4">Student Owner</th>
                  <th className="px-6 py-4">File Size</th>
                  <th className="px-6 py-4">Upload Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((note) => (
                  <tr key={note.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-700 border border-violet-200 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-slate-900 truncate max-w-xs block">
                          {note.filename}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <p className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
                          <User className="w-3 h-3 text-slate-400" />
                          {note.ownerName}
                        </p>
                        <p className="text-xs text-slate-400">{note.ownerEmail}</p>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60">
                        <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                        {formatSize(note.size)}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {formatDate(note.createdAt)}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        disabled={deleting === note.id}
                        onClick={() => handleDelete(note.id, note.filename)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 disabled:opacity-50 transition-colors"
                      >
                        {deleting === note.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                        {deleting === note.id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
