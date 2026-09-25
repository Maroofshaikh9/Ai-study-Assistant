"use client";

import Link from "next/link";
import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Notice from "@/components/Notice";
import { Eye, EyeOff } from "lucide-react";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const router = useRouter();
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

  // Password requirements
  const hasLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[@$!%*?&]/.test(password);
  const isValidPassword = hasLength && hasUpper && hasLower && hasNumber && hasSpecial;

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  async function handleSendOtp(event?: FormEvent) {
    if (event) event.preventDefault();
    if (loading) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address, such as name@gmail.com.");
      return;
    }

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
      // 1. Verify OTP
      const otpRes = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const otpData = await otpRes.json();

      if (!otpRes.ok) {
        setLoading(false);
        setError(otpData.error || "Failed to verify code.");
        return;
      }

      // 2. Complete Registration
      const regRes = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const regData = await regRes.json();
      setLoading(false);

      if (!regRes.ok) {
        setError(regData.error || "Could not create the account.");
        return;
      }

      setSuccess("Account created successfully. Redirecting to login...");
      setTimeout(() => router.push("/login"), 2000);
    } catch {
      setLoading(false);
      setError("Network error. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f7f6] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md card p-6 md:p-8">
        <Link href="/" className="text-sm text-brand-700">
          Back to Home
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-slate-800">Create Account</h1>
        <p className="mt-1 text-sm text-slate-500">
          Register as a student to upload notes and use AI tools.
        </p>

        {step === "details" ? (
          <>
            <form className="mt-6 space-y-4" onSubmit={handleSendOtp}>
            <Notice type="error" text={error} />
            <Notice type="success" text={success} />
            
            <label className="block text-sm">
              Full Name
              <input
                type="text"
                required
                className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2"
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={loading}
              />
            </label>
            <label className="block text-sm">
              Email
              <input
                type="email"
                required
                className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={loading}
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
                  disabled={loading}
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
            
            <label className="block text-sm">
              Confirm Password
              <div className="relative mt-1">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  className="w-full border border-slate-300 rounded-md px-3 py-2 pr-10"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>
            
            {password.length > 0 && (
              <div className="text-xs space-y-1 mt-2">
                <p className="font-medium text-slate-700">Password must contain:</p>
                <p className={hasLength ? "text-green-600" : "text-slate-500"}>
                  {hasLength ? "✓" : "✗"} At least 8 characters
                </p>
                <p className={hasUpper ? "text-green-600" : "text-slate-500"}>
                  {hasUpper ? "✓" : "✗"} One uppercase letter
                </p>
                <p className={hasLower ? "text-green-600" : "text-slate-500"}>
                  {hasLower ? "✓" : "✗"} One lowercase letter
                </p>
                <p className={hasNumber ? "text-green-600" : "text-slate-500"}>
                  {hasNumber ? "✓" : "✗"} One number
                </p>
                <p className={hasSpecial ? "text-green-600" : "text-slate-500"}>
                  {hasSpecial ? "✓" : "✗"} One special character (@$!%*?&)
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !isValidPassword || !name || !email || password !== confirmPassword}
              className="w-full mt-4 bg-brand-700 text-white py-2.5 rounded-md disabled:opacity-60"
            >
              {loading ? "Processing..." : "Send Verification Code"}
            </button>
          </form>
          
          <div className="flex items-center gap-4 mt-6">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="text-xs text-slate-400 font-medium">OR</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

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
          </>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={handleVerifyOtp}>
            <Notice type="error" text={error} />
            <Notice type="success" text={success} />
            
            <p className="text-sm text-slate-700">
              Enter the 6-digit code sent to:<br/>
              <span className="font-semibold">{email}</span>
            </p>

            <label className="block text-sm">
              Verification Code
              <input
                type="text"
                required
                maxLength={6}
                pattern="\d{6}"
                className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-center text-lg tracking-widest"
                value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))}
                disabled={loading}
                placeholder="000000"
              />
            </label>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-brand-700 text-white py-2.5 rounded-md disabled:opacity-60"
            >
              {loading ? "Verifying..." : "Verify Email"}
            </button>

            <div className="text-center mt-4">
              <button
                type="button"
                disabled={resendCooldown > 0 || loading}
                onClick={() => handleSendOtp()}
                className="text-sm text-brand-700 disabled:text-slate-400"
              >
                {resendCooldown > 0 ? `Resend code in 0:${resendCooldown.toString().padStart(2, "0")}` : "Resend Verification Code"}
              </button>
            </div>
          </form>
        )}

        {step === "details" && (
          <p className="mt-4 text-sm text-slate-600">
            Already registered?{" "}
            <Link href="/login" className="text-brand-700 font-medium">
              Login
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
