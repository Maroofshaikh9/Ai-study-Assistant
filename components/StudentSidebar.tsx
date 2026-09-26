"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import {
  LayoutDashboard,
  FileText,
  Sparkles,
  BrainCircuit,
  Layers,
  MessageSquareCode,
  LogOut,
  Menu,
  X,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/notes", label: "My Notes", icon: FileText },
  { href: "/dashboard/summary", label: "AI Summary", icon: Sparkles },
  { href: "/dashboard/quiz", label: "AI Quiz", icon: BrainCircuit },
  { href: "/dashboard/flashcards", label: "AI Flashcards", icon: Layers },
  { href: "/dashboard/chat", label: "Study Chat", icon: MessageSquareCode },
];

export default function StudentSidebar({ name }: { name: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Extract initial for user avatar
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "ST";

  return (
    <>
      {/* Mobile Top Navbar */}
      <div className="lg:hidden bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-700 to-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            SM
          </div>
          <span className="font-extrabold text-slate-900 tracking-tight">StudyMate</span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200/60 uppercase">
            Student
          </span>
        </Link>
        <button
          type="button"
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Overlay on Mobile */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:static top-0 left-0 bottom-0 z-50 w-72 bg-white border-r border-slate-200/80 flex flex-col justify-between transition-transform duration-300 ease-in-out h-full min-h-screen`}
      >
        <div className="flex flex-col flex-1">
          {/* Brand Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-700 via-brand-600 to-emerald-500 text-white flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform duration-200">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5">
                  StudyMate
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-brand-50 text-brand-700 border border-brand-200/60 uppercase">
                    AI
                  </span>
                </span>
                <span className="text-[11px] font-medium text-slate-500">Student Portal</span>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="px-4 py-6 space-y-1.5 flex-1">
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Study Tools
            </p>
            {links.map((link) => {
              const Icon = link.icon;
              const active =
                pathname === link.href ||
                (link.href !== "/dashboard" && pathname.startsWith(link.href));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    active
                      ? "bg-brand-50 text-brand-800 border border-brand-200/80 shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        active ? "text-brand-600" : "text-slate-400 group-hover:text-slate-600"
                      }`}
                    />
                    <span>{link.label}</span>
                  </div>

                  {active && (
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-600 shadow-xs" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* User Card & Logout Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/60 space-y-3">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-white border border-slate-200/80 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-500 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
              {initials}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-bold text-slate-800 truncate">{name}</span>
              <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                Verified Student
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-rose-700 hover:bg-rose-50/80 border border-transparent hover:border-rose-200/60 transition-all duration-200"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
