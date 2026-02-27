"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { requestHandler } from "@/app/src/utils";
import { toast } from "react-toastify";

export default function SignupPage() {
  const router = useRouter();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  // Step: "signup" → "verify"
  const [step, setStep] = useState<"signup" | "verify">("signup");

  // ─── Step 1: Create account & send OTP ───
  const handleSignup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await requestHandler(
      () => axios.post("/src/api/signup", { email, password }),
      setLoading,
      (data) => {
        toast.success(data.message);
        setStep("verify");
      },
      (err) => toast.error(err)
    );
  };

  // ─── Step 2: Verify OTP ───
  const handleVerify = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await requestHandler(
      () => axios.post("/src/api/verify-code", { email, otp }),
      setLoading,
      (data) => {
        toast.success(data.message);
        router.push("/login");
      },
      (err) => toast.error(err)
    );
  };

  // ─── Resend OTP (re-submits signup which resends for unverified users) ───
  const handleResend = async () => {
    await requestHandler(
      () => axios.post("/src/api/signup", { email, password }),
      setLoading,
      (data) => toast.success("OTP resent to your email"),
      (err) => toast.error(err)
    );
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-100 px-4">
      <section className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        {step === "signup" ? (
          <>
            <h1 className="text-2xl font-semibold text-zinc-900">Sign Up</h1>
            <p className="mt-1 text-sm text-zinc-600">
              Create your account — you&#39;ll verify via email OTP
            </p>

            <form onSubmit={handleSignup} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-800">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-black outline-none focus:border-zinc-500"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-800">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-black outline-none focus:border-zinc-500"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {loading ? "Creating account..." : "Sign Up"}
              </button>
            </form>

            <div className="mt-4 text-right">
              <button
                onClick={() => router.push("/login")}
                className="text-sm text-zinc-700 underline"
              >
                Already have an account? Login
              </button>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold text-zinc-900">Verify Email</h1>
            <p className="mt-1 text-sm text-zinc-600">
              Enter the 6-digit OTP sent to{" "}
              <span className="font-medium text-zinc-900">{email}</span>
            </p>

            <form onSubmit={handleVerify} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-800">
                  OTP Code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-center text-xl tracking-[0.5em] text-black outline-none focus:border-zinc-500"
                  placeholder="------"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </form>

            <div className="mt-4 flex items-center justify-between text-sm">
              <button
                onClick={() => setStep("signup")}
                className="text-zinc-700 underline"
              >
                Back
              </button>
              <button
                onClick={handleResend}
                disabled={loading}
                className="text-zinc-700 underline disabled:opacity-50"
              >
                Resend OTP
              </button>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
