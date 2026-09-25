"use client";

import Link from "next/link";
import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Notice from "@/components/Notice";
import { Eye, EyeOff } from "lucide-react";

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
    <div className="min-h-screen bg-[#f4f7f6] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md card p-6 md:p-8">
        <Link href="/login" className="text-sm text-brand-700">
          Back to Login
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-slate-800">Reset Password</h1>
        <p className="mt-1 text-sm text-slate-500">
          Follow the steps to regain access to your account.
        </p>

        {step === "email" ? (
          <form className="mt-6 space-y-4" onSubmit={handleSendOtp}>
            <Notice type="error" text={error} />
            <Notice type="success" text={success} />
            
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
           
            <button
              type="submit"
              disabled={loading || !email}
              className="w-full mt-4 bg-brand-700 text-white py-2.5 rounded-md disabled:opacity-60"
            >
              {loading ? "Processing..." : "Send Verification Code"}
            </button>
          </form>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={handleResetPassword}>
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

            <label className="block text-sm">
              New Password
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
              Confirm New Password
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
              disabled={loading || otp.length !== 6 || !isValidPassword || password !== confirmPassword}
              className="w-full bg-brand-700 text-white py-2.5 rounded-md disabled:opacity-60"
            >
              {loading ? "Resetting..." : "Reset Password"}
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
      </div>
    </div>
  );
}
