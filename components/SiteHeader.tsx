"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Sparkles, Menu, X, ArrowRight, LogIn } from "lucide-react";

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-200/80 py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 via-brand-600 to-emerald-400 text-white flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform duration-200">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
              StudyMate
              <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-brand-50 text-brand-700 border border-brand-200/60 uppercase tracking-wide">
                AI
              </span>
            </span>
            <span className="text-[11px] font-medium text-slate-500 -mt-1 hidden sm:block">
              Smart Study Assistant
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
          <a
            href="#home"
            className="hover:text-brand-600 transition-colors"
          >
            Home
          </a>
          <a
            href="#features"
            className="hover:text-brand-600 transition-colors"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="hover:text-brand-600 transition-colors"
          >
            How it Works
          </a>
          <a
            href="#about"
            className="hover:text-brand-600 transition-colors"
          >
            About
          </a>
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-brand-600 hover:bg-slate-100/70 transition-all"
          >
            <LogIn className="w-4 h-4" />
            Log in
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-700 hover:to-emerald-600 shadow-md shadow-brand-500/25 hover:shadow-lg hover:shadow-brand-500/35 hover:-translate-y-0.5 transition-all"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Toggle Navigation"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {open && (
        <div className="md:hidden border-b border-slate-200 bg-white/95 backdrop-blur-xl px-5 py-5 shadow-xl animate-fade-in-up">
          <div className="flex flex-col gap-3 font-semibold text-slate-700 text-sm">
            <a
              href="#home"
              onClick={() => setOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-slate-100 hover:text-brand-600 transition-colors"
            >
              Home
            </a>
            <a
              href="#features"
              onClick={() => setOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-slate-100 hover:text-brand-600 transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => setOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-slate-100 hover:text-brand-600 transition-colors"
            >
              How it Works
            </a>
            <a
              href="#about"
              onClick={() => setOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-slate-100 hover:text-brand-600 transition-colors"
            >
              About
            </a>
            <hr className="border-slate-100 my-1" />
            <div className="flex flex-col gap-2 pt-1">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="w-full text-center py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-brand-600 text-white font-semibold shadow-md shadow-brand-500/25 transition-all"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
