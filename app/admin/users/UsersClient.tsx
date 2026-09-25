"use client";

import { useState } from "react";
import Notice from "@/components/Notice";
import { formatDate } from "@/lib/format";
import { useRouter } from "next/navigation";

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

  async function handleDelete(id: string) {
    if (deleting) {
      return;
    }
    setDeleting(id);
    setError("");
    const response = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    const data = await response.json();
    setDeleting("");
    if (!response.ok) {
      setError(data.error || "Could not delete the user.");
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
        {initialUsers.length === 0 ? (
          <p className="p-5 text-sm text-slate-500">No users found.</p>
        ) : (
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Notes</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {initialUsers.map((user) => (
                <tr key={user.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">{user.name}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">{user.role}</td>
                  <td className="px-4 py-3">{user.notes}</td>
                  <td className="px-4 py-3">{formatDate(user.createdAt)}</td>
                  <td className="px-4 py-3">
                    {user.role === "student" ? (
                      <button
                        type="button"
                        disabled={deleting === user.id}
                        onClick={() => handleDelete(user.id)}
                        className="text-red-700 disabled:opacity-60"
                      >
                        {deleting === user.id ? "Deleting..." : "Delete"}
                      </button>
                    ) : (
                      "-"
                    )}
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
