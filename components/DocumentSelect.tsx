"use client";

import Link from "next/link";
import { FileText, UploadCloud, ChevronDown } from "lucide-react";

type Note = { id: string; filename: string };

export default function DocumentSelect({
  notes,
  value,
  onChange,
}: {
  notes: Note[];
  value: string;
  onChange: (id: string) => void;
}) {
  if (notes.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-4 text-center">
        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-2">
          <UploadCloud className="w-5 h-5 text-slate-400" />
        </div>
        <p className="text-sm font-medium text-slate-700">No documents found</p>
        <p className="text-xs text-slate-500 mt-0.5 mb-3">
          Upload a study PDF in My Notes first to use this AI tool.
        </p>
        <Link
          href="/dashboard/notes"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-all"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          Go to Upload Notes
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600">
          <FileText className="w-3.5 h-3.5 text-brand-600" />
          Select Study Material
        </label>
        <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
          {notes.length} {notes.length === 1 ? "document" : "documents"}
        </span>
      </div>

      <div className="relative">
        <select
          className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-3.5 pr-10 text-sm font-medium text-slate-800 shadow-sm transition-all hover:border-slate-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 cursor-pointer"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {notes.map((note) => (
            <option key={note.id} value={note.id}>
              {note.filename}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
