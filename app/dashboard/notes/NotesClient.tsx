"use client";

import { FormEvent, useState } from "react";
import Notice from "@/components/Notice";
import { formatDate, formatSize } from "@/lib/format";
import { useRouter } from "next/navigation";

type Note = {
  id: string;
  filename: string;
  size: number;
  createdAt: string;
};

export default function NotesClient({ initialNotes }: { initialNotes: Note[] }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleUpload(event: FormEvent) {
    event.preventDefault();
    if (loading) {
      return;
    }
    if (!file) {
      setError("Please choose a PDF file.");
      return;
    }

    const isPdf =
      file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setError("Only PDF files are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("PDF must be 5 MB or smaller.");
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
        setError(data.error || "Upload failed.");
        return;
      }

      setSuccess(data.message);
      setFile(null);
      router.refresh();
    } catch {
      setLoading(false);
      setError("Network error. Please try again.");
    }
  }

  async function handleDelete(id: string) {
    if (deleting) {
      return;
    }
    setDeleting(id);
    setError("");
    const response = await fetch(`/api/documents/${id}`, { method: "DELETE" });
    const data = await response.json();
    setDeleting("");
    if (!response.ok) {
      setError(data.error || "Could not delete the note.");
      return;
    }
    setSuccess(data.message);
    router.refresh();
  }

  return (
    <>
      <form onSubmit={handleUpload} className="card p-5 space-y-4">
        <Notice type="error" text={error} />
        <Notice type="success" text={success} />
        <input
          type="file"
          accept="application/pdf,.pdf"
          onChange={(event) => setFile(event.target.files?.[0] || null)}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-brand-700 text-white px-4 py-2 rounded-md disabled:opacity-60"
        >
          {loading ? "Uploading..." : "Upload PDF"}
        </button>
      </form>

      <section className="card overflow-x-auto mt-6">
        {initialNotes.length === 0 ? (
          <p className="p-5 text-sm text-slate-500">No notes uploaded yet.</p>
        ) : (
          <table className="w-full text-sm min-w-[520px]">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3">Filename</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3">Upload date</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {initialNotes.map((note) => (
                <tr key={note.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">{note.filename}</td>
                  <td className="px-4 py-3">{formatSize(note.size)}</td>
                  <td className="px-4 py-3">{formatDate(note.createdAt)}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      disabled={deleting === note.id}
                      onClick={() => handleDelete(note.id)}
                      className="text-red-700 disabled:opacity-60"
                    >
                      {deleting === note.id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}
