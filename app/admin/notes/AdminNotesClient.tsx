"use client";

import { useState } from "react";
import Notice from "@/components/Notice";
import { formatDate, formatSize } from "@/lib/format";
import { useRouter } from "next/navigation";

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

  async function handleDelete(id: string) {
    if (deleting) {
      return;
    }
    setDeleting(id);
    setError("");
    const response = await fetch(`/api/admin/documents/${id}`, {
      method: "DELETE",
    });
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
      <Notice type="error" text={error} />
      <Notice type="success" text={success} />
      <section className="card overflow-x-auto">
        {initialNotes.length === 0 ? (
          <p className="p-5 text-sm text-slate-500">No notes uploaded yet.</p>
        ) : (
          <table className="w-full text-sm min-w-[720px]">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3">Filename</th>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {initialNotes.map((note) => (
                <tr key={note.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">{note.filename}</td>
                  <td className="px-4 py-3">{note.ownerName}</td>
                  <td className="px-4 py-3">{note.ownerEmail}</td>
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
