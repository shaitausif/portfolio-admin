"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { requestHandler } from "@/app/src/utils";
import { toast } from "react-toastify";

export default function ForgetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    await requestHandler(
      () => axios.get(`/src/api/forget-password/${encodeURIComponent(email)}`),
      setLoading,
      (data) => {
        const msg = data.message || "OTP sent to your email.";
        setSuccessMessage(msg);
        toast.success(msg);
      },
      (err) => {
        setError(err);
        toast.error(err);
      }
    );
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-100 px-4">
      <section className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-zinc-900">Forgot Password</h1>
        <p className="mt-1 text-sm text-zinc-600">Enter your email to receive OTP</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-800">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-500"
              placeholder="you@example.com"
              required
            />
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {successMessage ? <p className="text-sm text-green-700">{successMessage}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>

        <div className="mt-4 text-right">
          <button
            onClick={() => router.push("/login")}
            className="text-sm text-zinc-700 underline"
          >
            Back to login
          </button>
        </div>
      </section>
    </main>
  );
}
