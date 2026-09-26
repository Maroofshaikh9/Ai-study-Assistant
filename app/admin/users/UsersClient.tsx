"use client";

import { useState } from "react";
import Notice from "@/components/Notice";
import { formatDate } from "@/lib/format";
import { useRouter } from "next/navigation";
import {
  Search,
  Trash2,
  Loader2,
  Shield,
  GraduationCap,
  FileText,
  Calendar,
} from "lucide-react";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  notes: number;
};

export default function UsersClient({ initialUsers }: { initialUsers: UserRow[] }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleting, setDeleting] = useState("");
  const [query, setQuery] = useState("");

  const filtered = initialUsers.filter((u) => {
    const q = query.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  async function handleDelete(id: string, name: string) {
    if (deleting) return;
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete user "${name}" and all their data?`
    );
    if (!confirmed) return;

    setDeleting(id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      const data = await response.json();
      setDeleting("");

      if (!response.ok) {
        setError(data.error || "Could not delete the user.");
        return;
      }
      setSuccess(data.message || "User successfully deleted.");
      router.refresh();
    } catch {
      setDeleting("");
      setError("An unexpected network error occurred while deleting the user.");
    }
  }

  return (
    <div className="space-y-6">
      <Notice type="error" text={error} />
      <Notice type="success" text={success} />

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-card">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by student name or email..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
        </div>
        <div className="text-xs font-semibold text-slate-500 px-2">
          Showing <span className="text-slate-900 font-bold">{filtered.length}</span> of {initialUsers.length} users
        </div>
      </div>

      {/* Table Container */}
      <section className="card bg-white border border-slate-200/80 rounded-2xl shadow-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <p className="font-semibold text-slate-700">No users match your query</p>
            <p className="text-xs text-slate-400">Try searching with a different name or email.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-left text-slate-500 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Notes Uploaded</th>
                  <th className="px-6 py-4">Registration Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((user) => {
                  const isAdmin = user.role === "admin";
                  return (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs uppercase ${
                              isAdmin
                                ? "bg-cyan-100 text-cyan-800 border border-cyan-200"
                                : "bg-brand-100 text-brand-800 border border-brand-200"
                            }`}
                          >
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-snug">{user.name}</p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${
                            isAdmin
                              ? "bg-cyan-50 text-cyan-700 border border-cyan-200/80"
                              : "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {isAdmin ? (
                            <>
                              <Shield className="w-3 h-3 text-cyan-600" />
                              Admin
                            </>
                          ) : (
                            <>
                              <GraduationCap className="w-3 h-3 text-slate-500" />
                              Student
                            </>
                          )}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60">
                          <FileText className="w-3.5 h-3.5 text-slate-400" />
                          {user.notes} {user.notes === 1 ? "note" : "notes"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {formatDate(user.createdAt)}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        {user.role === "student" ? (
                          <button
                            type="button"
                            disabled={deleting === user.id}
                            onClick={() => handleDelete(user.id, user.name)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 disabled:opacity-50 transition-colors"
                          >
                            {deleting === user.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                            {deleting === user.id ? "Deleting..." : "Delete"}
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Protected</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
