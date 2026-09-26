"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import {
  ShieldCheck,
  LayoutDashboard,
  Users,
  FileText,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";

const links = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "User Directory", icon: Users },
  { href: "/admin/notes", label: "Repository Notes", icon: FileText },
];

export default function AdminSidebar({ name }: { name: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile Top Header */}
      <div className="lg:hidden bg-slate-950 border-b border-slate-800 text-white px-4 py-3.5 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm tracking-tight">StudyMate Admin</span>
        </div>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="p-2 rounded-xl bg-slate-850 border border-slate-700/60 text-slate-300 hover:text-white"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Main Sidebar */}
      <aside
        className={`${
          open ? "flex" : "hidden"
        } lg:flex w-full lg:w-64 bg-slate-950 border-r border-slate-800/80 text-white min-h-[100dvh] lg:min-h-screen flex-col justify-between shrink-0 fixed lg:sticky top-0 z-50 lg:z-30`}
      >
        <div className="flex flex-col flex-1">
          {/* Brand header */}
          <div className="p-6 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-white block">
                  StudyMate
                </span>
                <span className="text-[11px] font-bold text-emerald-400 tracking-wider uppercase bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                  Admin Console
                </span>
              </div>
            </div>

            <div className="mt-5 p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-500/20 border border-brand-500/40 text-brand-400 font-bold text-xs flex items-center justify-center">
                {name?.charAt(0).toUpperCase() || "A"}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-slate-200 truncate">{name}</p>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Master Admin</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-1.5 flex-1">
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              System Management
            </p>
            {links.map((link) => {
              const active =
                pathname === link.href ||
                (link.href !== "/admin" && pathname.startsWith(link.href));
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    active
                      ? "bg-brand-600 text-white shadow-lg shadow-brand-600/25 border border-brand-500/50"
                      : "text-slate-400 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-white" : "text-slate-400"}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            <div className="pt-4 mt-4 border-t border-slate-800/80">
              <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Quick Shortcuts
              </p>
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
              >
                <span className="flex items-center gap-3">
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                  Student Portal
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">View</span>
              </Link>
            </div>
          </nav>
        </div>

        {/* Footer with Sign Out */}
        <div className="p-4 border-t border-slate-800/80">
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
