"use client";

import Link from "next/link";
import { FormEvent, useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Notice from "@/components/Notice";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [countdown, setCountdown] = useState("");

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

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (loading || lockedUntil) return;

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
    <div className="min-h-screen bg-[#f4f7f6] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md card p-6 md:p-8">
        <Link href="/" className="text-sm text-brand-700">
          Back to Home
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-slate-800">Student Login</h1>
        <p className="mt-1 text-sm text-slate-500">
          Enter your email and password to continue.
        </p>

        <button
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="mt-6 w-full flex items-center justify-center gap-2 border border-slate-300 rounded-md py-2.5 hover:bg-slate-50 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          <span className="text-sm font-medium text-slate-700">Continue with Google</span>
        </button>

        <div className="flex items-center gap-4 mt-6">
          <div className="flex-1 h-px bg-slate-200"></div>
          <span className="text-xs text-slate-400 font-medium">OR</span>
          <div className="flex-1 h-px bg-slate-200"></div>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <Notice type="error" text={countdown ? `Too many incorrect attempts. ${countdown}` : error} />
          
          <label className="block text-sm">
            Email
            <input
              type="email"
              required
              className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={!!lockedUntil || loading}
            />
          </label>
          
          <label className="block text-sm">
            Password
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                required
                className="w-full border border-slate-300 rounded-md px-3 py-2 pr-10"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={!!lockedUntil || loading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>
          
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-slate-600">
              <input
                type="checkbox"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
                disabled={!!lockedUntil || loading}
              />
              Remember me
            </label>
            <Link href="/forgot-password" className="text-brand-700 font-medium">
              Forgot password?
            </Link>
          </div>
          
          <button
            type="submit"
            disabled={loading || !!lockedUntil}
            className="w-full bg-brand-700 text-white py-2.5 rounded-md disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          New student?{" "}
          <Link href="/register" className="text-brand-700 font-medium">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
