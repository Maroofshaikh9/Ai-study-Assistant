"use client";

import Link from "next/link";
import { useState } from "react";

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-brand-700 text-white font-bold">
            SM
          </span>
          <span className="text-lg font-semibold text-brand-800">StudyMate</span>
        </Link>

        <button
          className="md:hidden border border-slate-300 rounded px-3 py-1 text-sm"
          onClick={() => setOpen(!open)}
          type="button"
        >
          Menu
        </button>

        <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600">
          <a href="#home">Home</a>
          <a href="#features">Features</a>
          <a href="#about">About</a>
          <Link href="/login">Login</Link>
          <Link
            href="/register"
            className="bg-brand-700 text-white px-4 py-2 rounded-md"
          >
            Get Started
          </Link>
        </nav>
      </div>

      {open && (
        <div className="md:hidden border-t border-slate-200 px-4 py-3 flex flex-col gap-3 text-sm">
          <a href="#home" onClick={() => setOpen(false)}>
            Home
          </a>
          <a href="#features" onClick={() => setOpen(false)}>
            Features
          </a>
          <a href="#about" onClick={() => setOpen(false)}>
            About
          </a>
          <Link href="/login" onClick={() => setOpen(false)}>
            Login
          </Link>
          <Link
            href="/register"
            className="bg-brand-700 text-white px-4 py-2 rounded-md text-center"
            onClick={() => setOpen(false)}
          >
            Get Started
          </Link>
        </div>
      )}
    </header>
  );
}
