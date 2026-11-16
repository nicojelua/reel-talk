"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Navbar() {
  const supabase = createClient();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (mounted) {
        setIsLoggedIn(Boolean(user));
        setAuthLoading(false);
      }
    }

    checkUser();

    // Keep the Navbar updated whenever the auth state changes.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setIsLoggedIn(Boolean(session?.user));
        setAuthLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <nav className="fixed left-0 top-0 z-50 flex w-full items-center justify-between border-b border-[#2A2524] bg-[#151313]/95 px-6 py-5 backdrop-blur-md">
      {/* LOGO */}
      <Link
        href="/"
        className="font-bold tracking-wide transition hover:text-[#E8A0A8]"
      >
        REEL TALK
      </Link>

      {/* NAVIGATION */}
      <div className="flex items-center gap-6">
        <Link
          href="/"
          className="transition hover:text-[#E8A0A8]"
        >
          Home
        </Link>

        <Link
          href="/journal"
          className="transition hover:text-[#E8A0A8]"
        >
          Journal
        </Link>

        <Link
          href="/watchlist"
          className="transition hover:text-[#E8A0A8]"
        >
          Watchlist
        </Link>

        <span className="cursor-default text-[#817774]">
          Friends
        </span>

        <span className="cursor-default text-[#817774]">
          Reel Recap
        </span>

        {/* ACCOUNT / LOGIN */}
        {!authLoading &&
          (isLoggedIn ? (
            <Link
              href="/account"
              className="rounded-lg border border-[#3A3432] px-4 py-2 text-sm font-semibold text-[#F5EEE6] transition hover:border-[#E8A0A8] hover:text-[#E8A0A8]"
            >
              Account
            </Link>
          ) : (
            <Link
              href="/auth"
              className="rounded-lg bg-[#E8A0A8] px-4 py-2 text-sm font-bold text-[#151313] transition hover:opacity-90"
            >
              Log In
            </Link>
          ))}
      </div>
    </nav>
  );
}