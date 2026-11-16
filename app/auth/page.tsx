"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<"signup" | "login">("signup");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.SyntheticEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          throw error;
        }

        setMessage(
          "Account created! Check your email to confirm your Reel Talk account."
        );
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          throw error;
        }

        // Login successful → send the user to the homepage
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  function switchMode(newMode: "signup" | "login") {
    setMode(newMode);
    setMessage("");
    setError("");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#151313] px-6 py-12 text-[#F5EEE6]">
      <div className="relative w-full max-w-md">

        {/* SCRAPBOOK TAPE */}
        <div className="absolute -top-4 left-1/2 h-8 w-28 -translate-x-1/2 -rotate-2 bg-[#D9B7AD]/70" />

        {/* AUTH CARD */}
        <div className="rounded-3xl border border-[#3A3432] bg-[#211D1C] p-8 shadow-2xl">

          {/* BRAND */}
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#E8A0A8]">
              Reel Talk
            </p>

            <h1 className="mt-3 text-4xl font-bold">
              {mode === "signup"
                ? "Start your journal"
                : "Welcome back"}
            </h1>

            <p className="mt-3 text-sm leading-6 text-[#B8AEA8]">
              {mode === "signup"
                ? "Movies end. The conversation doesn't."
                : "Your tickets are waiting for you."}
            </p>
          </div>

          {/* SIGN UP / LOGIN TABS */}
          <div className="mt-8 grid grid-cols-2 rounded-xl bg-[#151313] p-1">
            <button
              type="button"
              onClick={() => switchMode("signup")}
              className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                mode === "signup"
                  ? "bg-[#E8A0A8] text-[#151313]"
                  : "text-[#B8AEA8] hover:text-[#F5EEE6]"
              }`}
            >
              Sign Up
            </button>

            <button
              type="button"
              onClick={() => switchMode("login")}
              className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                mode === "login"
                  ? "bg-[#E8A0A8] text-[#151313]"
                  : "text-[#B8AEA8] hover:text-[#F5EEE6]"
              }`}
            >
              Log In
            </button>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="mt-8">

            {/* EMAIL */}
            <div>
              <label
                htmlFor="email"
                className="text-sm font-semibold"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="mt-2 w-full rounded-xl border border-[#3A3432] bg-[#151313] px-4 py-3 text-[#F5EEE6] outline-none transition placeholder:text-[#716866] focus:border-[#E8A0A8]"
              />
            </div>

            {/* PASSWORD */}
            <div className="mt-5">
              <label
                htmlFor="password"
                className="text-sm font-semibold"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder={
                  mode === "signup"
                    ? "At least 8 characters"
                    : "Enter your password"
                }
                autoComplete={
                  mode === "signup"
                    ? "new-password"
                    : "current-password"
                }
                minLength={8}
                required
                className="mt-2 w-full rounded-xl border border-[#3A3432] bg-[#151313] px-4 py-3 text-[#F5EEE6] outline-none transition placeholder:text-[#716866] focus:border-[#E8A0A8]"
              />

              {mode === "signup" && (
                <p className="mt-2 text-xs text-[#817774]">
                  Minimum 8 characters
                </p>
              )}
            </div>

            {/* ERROR MESSAGE */}
            {error && (
              <div className="mt-5 rounded-xl border border-[#E8A0A8]/30 bg-[#E8A0A8]/10 p-3">
                <p className="text-sm text-[#F2B6BD]">
                  {error}
                </p>
              </div>
            )}

            {/* SUCCESS MESSAGE */}
            {message && (
              <div className="mt-5 rounded-xl border border-[#F1DFCC]/20 bg-[#F1DFCC]/10 p-3">
                <p className="text-sm text-[#F1DFCC]">
                  {message}
                </p>
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="mt-7 w-full rounded-xl bg-[#E8A0A8] px-5 py-3 font-bold text-[#151313] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "One sec..."
                : mode === "signup"
                  ? "Create Account 🎟️"
                  : "Log In"}
            </button>

          </form>

          {/* SCRAPBOOK DETAIL */}
          <div className="mt-8 border-t border-dashed border-[#4A4240] pt-5 text-center">
            <p className="-rotate-1 text-xs italic text-[#817774]">
              every great watch deserves a page in the journal
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}