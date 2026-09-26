"use client";

import Link from "next/link";
import { FormEvent, useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import Notice from "@/components/Notice";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Check,
  X,
  KeyRound,
  Loader2,
  ShieldCheck,
} from "lucide-react";

export default function RegisterPage() {
  const [step, setStep] = useState<"details" | "otp">("details");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
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

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!isValidPassword) {
      setError("Please satisfy all password complexity rules.");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error || "Failed to send verification code.");
        return;
      }

      setStep("otp");
      setSuccess("Verification code sent to your email.");
      setResendCooldown(60);
    } catch {
      setLoading(false);
      setError("Network error. Please try again.");
    }
  }

  async function handleVerifyOtp(event: FormEvent) {
    event.preventDefault();
    if (loading) return;

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const verifyRes = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const verifyData = await verifyRes.json();

      if (!verifyRes.ok) {
        setLoading(false);
        setError(verifyData.error || "Invalid or expired verification code.");
        return;
      }

      const regRes = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const regData = await regRes.json();

      if (!regRes.ok) {
        setLoading(false);
        setError(regData.error || "Registration failed.");
        return;
      }

      const signInRes = await signIn("credentials", {
        email,
        password,
        callbackUrl: "/dashboard",
      });

      if (signInRes?.error) {
        setLoading(false);
        setSuccess("Account created successfully! Redirecting to login...");
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      }
    } catch {
      setLoading(false);
      setError("An unexpected error occurred. Please try again.");
    }
  }

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

      {/* Main Registration Card */}
      <div className="w-full max-w-md rounded-3xl border border-slate-200/90 bg-white p-7 sm:p-9 shadow-xl shadow-slate-900/5 space-y-6">
        <div>
          <div className="w-11 h-11 rounded-2xl bg-brand-50 border border-brand-200/60 text-brand-700 flex items-center justify-center mb-3 shadow-xs">
            <Sparkles className="w-5 h-5 text-brand-600" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Create Student Account
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Sign up to upload lecture notes, generate quizzes, and chat with AI.
          </p>

          {/* Stepper Indicator */}
          <div className="mt-4 flex items-center gap-2">
            <div className={`flex-1 h-1.5 rounded-full transition-colors ${step === "details" ? "bg-brand-600" : "bg-brand-500"}`} />
            <div className={`flex-1 h-1.5 rounded-full transition-colors ${step === "otp" ? "bg-brand-600" : "bg-slate-200"}`} />
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] font-semibold text-slate-400">
            <span className={step === "details" ? "text-brand-700" : "text-slate-500"}>1. Account Details</span>
            <span className={step === "otp" ? "text-brand-700" : "text-slate-400"}>2. Email Verification</span>
          </div>
        </div>

        {step === "details" ? (
          <>
            <form className="space-y-4" onSubmit={handleSendOtp}>
              <Notice type="error" text={error} />
              <Notice type="success" text={success} />

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Full Name
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Alex Morgan"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 shadow-xs hover:border-slate-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all disabled:bg-slate-50"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  University / Student Email
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="alex@university.edu"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 shadow-xs hover:border-slate-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all disabled:bg-slate-50"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Create Password
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
                  Confirm Password
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
                disabled={loading || !isValidPassword || !name || !email || password !== confirmPassword}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-700 hover:to-emerald-700 shadow-md shadow-brand-500/25 hover:shadow-lg hover:shadow-brand-500/35 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:pointer-events-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200/80"></div>
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                OR
              </span>
              <div className="flex-1 h-px bg-slate-200/80"></div>
            </div>

            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="w-full flex items-center justify-center gap-2.5 border border-slate-200 bg-white hover:bg-slate-50/80 rounded-xl py-2.5 px-4 text-xs font-semibold text-slate-700 shadow-xs hover:border-slate-300 transition-all duration-200"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" className="shrink-0">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>Continue with Google</span>
            </button>
          </>
        ) : (
          <form className="space-y-4" onSubmit={handleVerifyOtp}>
            <Notice type="error" text={error} />
            <Notice type="success" text={success} />

            <div className="rounded-2xl border border-brand-200/80 bg-brand-50/50 p-4 text-center space-y-1">
              <KeyRound className="w-6 h-6 text-brand-600 mx-auto mb-1" />
              <p className="text-xs text-slate-600">
                A 6-digit confirmation code was sent to:
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

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-700 hover:to-emerald-700 shadow-md shadow-brand-500/25 hover:shadow-lg hover:shadow-brand-500/35 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:pointer-events-none"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify Email &amp; Complete Setup</span>
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
          Already registered?{" "}
          <Link
            href="/login"
            className="font-bold text-brand-700 hover:text-brand-800 transition-colors"
          >
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
