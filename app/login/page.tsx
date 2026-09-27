"use client";

import Link from "next/link";
import { FormEvent, useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Notice from "@/components/Notice";
import { Eye, EyeOff, Mail, Lock, Sparkles, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [countdown, setCountdown] = useState("");

  // Inspect OAuth errors from URL redirect parameters
  const oauthError = searchParams.get("error");
  useEffect(() => {
    if (oauthError) {
      setGoogleLoading(false);
      if (["OAuthCallback", "OAuthSignin", "Callback"].includes(oauthError)) {
        setError("Google sign-in was interrupted or encountered a network issue. Please try again.");
      } else if (oauthError === "AccessDenied") {
        setError("Google sign-in was cancelled or permission was denied.");
      } else {
        setError("Authentication could not be completed. Please try again.");
      }
    }
  }, [oauthError]);

  // Mobile safety: reset googleLoading if user returns to this page after aborting/switching apps
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        setGoogleLoading(false);
      }
    };
    const handlePageShow = () => {
      setGoogleLoading(false);
    };

    window.addEventListener("pageshow", handlePageShow);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  useEffect(() => {
    if (!lockedUntil) return;
    const interval = setInterval(() => {
      const now = Date.now();
      if (now >= lockedUntil) {
        setLockedUntil(null);
        setCountdown("");
        setError("");
        clearInterval(interval);
        return;
      }
      const remainingSeconds = Math.ceil((lockedUntil - now) / 1000);
      const m = Math.floor(remainingSeconds / 60);
      const s = remainingSeconds % 60;
      setCountdown(`Try again in ${m}:${s.toString().padStart(2, "0")}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  async function handleGoogleSignIn() {
    if (googleLoading || loading || !!lockedUntil) return;
    setError("");
    setGoogleLoading(true);

    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch {
      setGoogleLoading(false);
      setError("Unable to connect to Google. Please check your network connection and try again.");
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (loading || googleLoading || lockedUntil) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address, such as name@gmail.com.");
      return;
    }

    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (!result || result.error) {
      const errMsg = result?.error || "Invalid email or password.";
      setError(errMsg);
      if (errMsg.includes("Too many incorrect attempts")) {
        setLockedUntil(Date.now() + 60000);
        setCountdown("Try again in 1:00");
      }
      return;
    }

    if (!remember) {
      sessionStorage.setItem("studymate-session", "1");
    }

    router.push("/dashboard");
  }

  return (
    <div className="w-full max-w-md rounded-3xl border border-slate-200/90 bg-white p-7 sm:p-9 shadow-xl shadow-slate-900/5 space-y-6">
      <div>
        <div className="w-11 h-11 rounded-2xl bg-brand-50 border border-brand-200/60 text-brand-700 flex items-center justify-center mb-3 shadow-xs">
          <Sparkles className="w-5 h-5 text-brand-600" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
          Welcome back
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Log in to access your study notes, quizzes, and AI tutor.
        </p>
      </div>

      {/* Google OAuth Button with clear loading & duplicate-click protection */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={googleLoading || loading || !!lockedUntil}
        className="w-full flex items-center justify-center gap-2.5 border border-slate-200 bg-white hover:bg-slate-50/80 rounded-xl py-2.5 px-4 text-xs font-semibold text-slate-700 shadow-xs hover:border-slate-300 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {googleLoading ? (
          <>
            <Loader2 className="w-4 h-4 text-brand-600 animate-spin" />
            <span>Connecting to Google...</span>
          </>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" className="shrink-0">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>Continue with Google</span>
          </>
        )}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-slate-200/80"></div>
        <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
          OR
        </span>
        <div className="flex-1 h-px bg-slate-200/80"></div>
      </div>

      {/* Credentials Form */}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Notice type="error" text={countdown ? `Too many incorrect attempts. ${countdown}` : error} />

        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Email Address
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              required
              placeholder="student@university.edu"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 shadow-xs hover:border-slate-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all disabled:bg-slate-50"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={!!lockedUntil || loading || googleLoading}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm font-medium text-slate-900 placeholder:text-slate-400 shadow-xs hover:border-slate-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all disabled:bg-slate-50"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={!!lockedUntil || loading || googleLoading}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 transition-colors"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center text-xs font-medium text-slate-600 pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              className="rounded border-slate-300 text-brand-600 focus:ring-brand-500/30 w-4 h-4 cursor-pointer"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
              disabled={!!lockedUntil || loading || googleLoading}
            />
            <span>Remember my session</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading || googleLoading || !!lockedUntil}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-700 hover:to-emerald-700 shadow-md shadow-brand-500/25 hover:shadow-lg hover:shadow-brand-500/35 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:pointer-events-none"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Signing In...</span>
            </>
          ) : (
            <>
              <span>Sign In to StudyMate</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
        New to StudyMate?{" "}
        <Link
          href="/register"
          className="font-bold text-brand-700 hover:text-brand-800 transition-colors"
        >
          Create an Account
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-mesh-academic flex flex-col justify-center items-center p-4 sm:p-6">
      {/* Top Brand Link */}
      <div className="w-full max-w-md mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-brand-600 transition-colors py-1 px-2.5 rounded-lg hover:bg-slate-100"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Home
        </Link>
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
          <div className="w-5 h-5 rounded-md bg-brand-600 text-white flex items-center justify-center text-[10px]">
            SM
          </div>
          StudyMate
        </div>
      </div>

      <Suspense
        fallback={
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-9 flex items-center justify-center min-h-[380px]">
            <Loader2 className="w-6 h-6 text-brand-600 animate-spin" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
