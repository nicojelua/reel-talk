import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type WatchlistEntry = {
  id: number;
  tmdb_id: number;
  media_type: string;
  title: string;
  poster_path: string | null;
  year: string | null;
  status: string | null;
  created_at: string;
};

export default async function WatchlistPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="min-h-screen bg-[#151313] px-6 pb-16 pt-32 text-[#F5EEE6]">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#E8A0A8]">
            Reel Talk
          </p>

          <h1 className="mt-3 text-5xl font-bold">
            Watchlist
          </h1>

          <div className="mt-10 rounded-2xl border border-[#3A3432] bg-[#211D1C] p-8">
            <p className="text-[#B8AEA8]">
              Log in to start building your watchlist.
            </p>

            <Link
              href="/auth"
              className="mt-5 inline-block rounded-xl bg-[#E8A0A8] px-5 py-3 font-semibold text-[#151313] transition hover:opacity-90"
            >
              Log In
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const { data, error } = await supabase
    .from("journal_entries")
    .select(
      "id, tmdb_id, media_type, title, poster_path, year, status, created_at"
    )
    .eq("user_id", user.id)
    .in("status", ["planned", "watching"])
    .order("created_at", {
      ascending: false,
    });

  const entries =
    (data as WatchlistEntry[] | null) ?? [];

  const currentlyWatching = entries.filter(
    (entry) => entry.status === "watching"
  );

  const planned = entries.filter(
    (entry) => entry.status === "planned"
  );

  function renderPosterCard(
    entry: WatchlistEntry,
    label: string
  ) {
    const posterUrl = entry.poster_path
      ? `https://image.tmdb.org/t/p/w500${entry.poster_path}`
      : null;

    return (
      <Link
        key={entry.id}
        href={`/title/${entry.tmdb_id}?type=${entry.media_type}`}
        className="group"
      >
        <div className="relative overflow-hidden rounded-xl bg-[#242020] shadow-lg transition duration-200 group-hover:-translate-y-1">
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={`${entry.title} poster`}
              className="aspect-[2/3] w-full object-cover"
            />
          ) : (
            <div className="flex aspect-[2/3] items-center justify-center p-4 text-center text-sm text-[#B8AEA8]">
              No Poster
            </div>
          )}

          <div className="absolute bottom-3 left-3 rounded-full bg-[#F1DFCC] px-3 py-1 text-xs font-bold text-[#211B19] shadow">
            {label}
          </div>
        </div>

        <h3 className="mt-3 font-bold leading-tight">
          {entry.title}
        </h3>

        <p className="mt-1 text-sm text-[#817774]">
          {entry.year}
          {" • "}
          {entry.media_type === "tv"
            ? "TV Show"
            : "Movie"}
        </p>
      </Link>
    );
  }

  return (
    <main className="min-h-screen bg-[#151313] px-6 pb-20 pt-32 text-[#F5EEE6]">
      <div className="mx-auto max-w-6xl">

        {/* PAGE HEADER */}
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#E8A0A8]">
            Reel Talk
          </p>

          <h1 className="mt-3 text-5xl font-bold">
            Watchlist
          </h1>

          <p className="mt-3 text-[#B8AEA8]">
            What you're watching now and what's
            waiting for movie night.
          </p>
        </header>

        {/* DATABASE ERROR */}
        {error && (
          <div className="mt-10 rounded-2xl border border-[#E8A0A8]/30 bg-[#E8A0A8]/10 p-5">
            <p className="text-sm text-[#F2B6BD]">
              We couldn't load your watchlist:{" "}
              {error.message}
            </p>
          </div>
        )}

        {/* EMPTY WATCHLIST */}
        {!error && entries.length === 0 && (
          <div className="relative mt-12 max-w-xl rotate-[-1deg] bg-[#F1DFCC] p-8 text-[#211B19] shadow-xl">

            <div className="absolute -top-4 left-1/2 h-8 w-28 -translate-x-1/2 rotate-2 bg-[#D9B7AD]/80" />

            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#8A6D64]">
              Watchlist
            </p>

            <h2 className="mt-3 text-2xl font-bold">
              Nothing saved yet 🍿
            </h2>

            <p className="mt-3 leading-7 text-[#665A55]">
              Found something interesting? Save it
              here for later or mark something as
              currently watching.
            </p>

            <Link
              href="/"
              className="mt-6 inline-block rounded-lg bg-[#211B19] px-5 py-3 font-bold text-[#F1DFCC]"
            >
              Find Something to Watch
            </Link>
          </div>
        )}

        {!error && entries.length > 0 && (
          <>
            {/* CURRENTLY WATCHING */}
            <section className="mt-14">

              <div className="flex items-end justify-between gap-4 border-b border-[#2A2524] pb-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#E8A0A8]">
                    In Progress
                  </p>

                  <h2 className="mt-2 text-3xl font-bold">
                    Currently Watching 📺
                  </h2>
                </div>

                <p className="text-sm text-[#817774]">
                  {currentlyWatching.length}{" "}
                  {currentlyWatching.length === 1
                    ? "title"
                    : "titles"}
                </p>
              </div>

              {currentlyWatching.length > 0 ? (
                <div className="mt-7 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {currentlyWatching.map(
                    (entry) =>
                      renderPosterCard(
                        entry,
                        "📺 Watching"
                      )
                  )}
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-dashed border-[#3A3432] bg-[#1B1818] p-6">
                  <p className="text-[#B8AEA8]">
                    Nothing in progress right now.
                    Pick something from your plan to
                    watch list when you're ready.
                  </p>
                </div>
              )}

            </section>

            {/* PLAN TO WATCH */}
            <section className="mt-16">

              <div className="flex items-end justify-between gap-4 border-b border-[#2A2524] pb-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#E8A0A8]">
                    Up Next
                  </p>

                  <h2 className="mt-2 text-3xl font-bold">
                    Plan to Watch 🍿
                  </h2>
                </div>

                <p className="text-sm text-[#817774]">
                  {planned.length}{" "}
                  {planned.length === 1
                    ? "title"
                    : "titles"}
                </p>
              </div>

              {planned.length > 0 ? (
                <div className="mt-7 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {planned.map(
                    (entry) =>
                      renderPosterCard(
                        entry,
                        "🍿 Plan to Watch"
                      )
                  )}
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-dashed border-[#3A3432] bg-[#1B1818] p-6">
                  <p className="text-[#B8AEA8]">
                    Your queue is empty. Search for
                    something that looks good and
                    save it for later.
                  </p>
                </div>
              )}

            </section>
          </>
        )}

      </div>
    </main>
  );
}