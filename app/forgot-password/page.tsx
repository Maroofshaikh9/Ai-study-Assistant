"use client";

import Link from "next/link";
import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Notice from "@/components/Notice";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowLeft,
  ArrowRight,
  Check,
  X,
  KeyRound,
  Loader2,
  ShieldAlert,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const hasLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[@$!%*?&]/.test(password);
  const isValidPassword = hasLength && hasUpper && hasLower && hasNumber && hasSpecial;

  async function handleSendOtp(event?: FormEvent) {
    if (event) event.preventDefault();
    if (loading) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error || "Failed to send reset code.");
        return;
      }

      setStep("reset");
      setSuccess("If an account exists, a verification code has been sent to your email.");
      setResendCooldown(60);
    } catch {
      setLoading(false);
      setError("Network error. Please try again.");
    }
  }

  async function handleResetPassword(event: FormEvent) {
    event.preventDefault();
    if (loading) return;

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!isValidPassword) {
      setError("Please meet all password requirements.");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword: password }),
      });
      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error || "Failed to reset password.");
        return;
      }

      setSuccess("Password has been reset successfully. Redirecting to login...");
      setTimeout(() => router.push("/login"), 2000);
    } catch {
      setLoading(false);
      setError("Network error. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-mesh-academic flex flex-col justify-center items-center p-4 sm:p-6">
      {/* Top Brand Link */}
      <div className="w-full max-w-md mb-6 flex items-center justify-between">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-brand-600 transition-colors py-1 px-2.5 rounded-lg hover:bg-slate-100"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Login
        </Link>
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
          <div className="w-5 h-5 rounded-md bg-brand-600 text-white flex items-center justify-center text-[10px]">
            SM
          </div>
          StudyMate
        </div>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md rounded-3xl border border-slate-200/90 bg-white p-7 sm:p-9 shadow-xl shadow-slate-900/5 space-y-6">
        <div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200/60 text-amber-700 flex items-center justify-center mb-3 shadow-xs">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Reset Password
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Recover your student account using email OTP verification.
          </p>
        </div>

        {step === "email" ? (
          <form className="space-y-4" onSubmit={handleSendOtp}>
            <Notice type="error" text={error} />
            <Notice type="success" text={success} />

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Registered Student Email
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
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-700 hover:to-emerald-700 shadow-md shadow-brand-500/25 hover:shadow-lg hover:shadow-brand-500/35 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:pointer-events-none"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending Code...</span>
                </>
              ) : (
                <>
                  <span>Send Recovery Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={handleResetPassword}>
            <Notice type="error" text={error} />
            <Notice type="success" text={success} />

            <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-4 text-center space-y-1">
              <KeyRound className="w-6 h-6 text-amber-600 mx-auto mb-1" />
              <p className="text-xs text-slate-600">
                A 6-digit recovery code was sent to:
              </p>
              <p className="text-sm font-bold text-slate-900 break-all">{email}</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-center text-xs font-bold uppercase tracking-wider text-slate-700">
                Enter 6-Digit Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                pattern="\d{6}"
                className="w-full rounded-2xl border border-slate-300 bg-white py-3 px-4 text-center text-2xl font-mono font-bold tracking-[0.5em] text-slate-900 shadow-xs focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15 transition-all"
                value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
                disabled={loading}
                placeholder="••••••"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                New Password
              </label>
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
                  disabled={loading}
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

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm font-medium text-slate-900 placeholder:text-slate-400 shadow-xs hover:border-slate-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all disabled:bg-slate-50"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Password complexity checklist */}
            {password.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 space-y-1.5 text-[11px]">
                <p className="font-bold text-slate-700">Password requirements:</p>
                <div className="grid grid-cols-2 gap-1.5 text-slate-600">
                  <span className={`flex items-center gap-1.5 ${hasLength ? "text-emerald-700 font-semibold" : "text-slate-500"}`}>
                    {hasLength ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-300" />}
                    8+ Characters
                  </span>
                  <span className={`flex items-center gap-1.5 ${hasUpper ? "text-emerald-700 font-semibold" : "text-slate-500"}`}>
                    {hasUpper ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-300" />}
                    Uppercase letter
                  </span>
                  <span className={`flex items-center gap-1.5 ${hasLower ? "text-emerald-700 font-semibold" : "text-slate-500"}`}>
                    {hasLower ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-300" />}
                    Lowercase letter
                  </span>
                  <span className={`flex items-center gap-1.5 ${hasNumber ? "text-emerald-700 font-semibold" : "text-slate-500"}`}>
                    {hasNumber ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-300" />}
                    One number
                  </span>
                  <span className={`col-span-2 flex items-center gap-1.5 ${hasSpecial ? "text-emerald-700 font-semibold" : "text-slate-500"}`}>
                    {hasSpecial ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-300" />}
                    Special character (@$!%*?&)
                  </span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || otp.length !== 6 || !isValidPassword || password !== confirmPassword}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-700 hover:to-emerald-700 shadow-md shadow-brand-500/25 hover:shadow-lg hover:shadow-brand-500/35 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:pointer-events-none"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <span>Save New Password</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                disabled={resendCooldown > 0 || loading}
                onClick={() => handleSendOtp()}
                className="text-xs font-semibold text-brand-700 hover:text-brand-800 disabled:text-slate-400 transition-colors"
              >
                {resendCooldown > 0
                  ? `Resend code in 0:${resendCooldown.toString().padStart(2, "0")}`
                  : "Didn't receive a code? Resend Code"}
              </button>
            </div>
          </form>
        )}

        <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
          Remembered your password?{" "}
          <Link
            href="/login"
            className="font-bold text-brand-700 hover:text-brand-800 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
