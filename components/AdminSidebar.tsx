"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/notes", label: "All Notes" },
];

export default function AdminSidebar({ name }: { name: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="lg:hidden bg-brand-800 text-white px-4 py-3 flex items-center justify-between">
        <span className="font-semibold">StudyMate Admin</span>
        <button
          type="button"
          className="border border-white/40 rounded px-3 py-1 text-sm"
          onClick={() => setOpen(!open)}
        >
          Menu
        </button>
      </div>

      <aside
        className={`${
          open ? "flex" : "hidden"
        } lg:flex w-full lg:w-64 bg-brand-800 text-white min-h-[100dvh] lg:min-h-screen flex-col`}
      >
        <div className="px-5 py-6 border-b border-white/10">
          <p className="font-semibold">StudyMate</p>
          <p className="text-xs text-white/70">Administrator</p>
          <p className="mt-4 text-sm text-white/80 truncate">{name}</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {links.map((link) => {
            const active =
              pathname === link.href ||
              (link.href !== "/admin" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`block rounded-md px-3 py-2 text-sm ${
                  active ? "bg-white text-brand-800" : "hover:bg-white/10"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/10">
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="w-full text-left rounded-md px-3 py-2 text-sm hover:bg-white/10"
          >
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
