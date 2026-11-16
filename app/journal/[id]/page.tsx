import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Journal = {
  id: number;
  owner_id: string;
  name: string;
  description: string | null;
  visibility: string;
  cover_style: string | null;
};

type JournalEntry = {
  id: number;
  created_at: string;
  user_id: string;
  journal_id: number | null;
  tmdb_id: number;
  media_type: string;
  title: string;
  poster_path: string | null;
  year: string | null;
  status: string | null;
  watched_date: string | null;
  watched_time: string | null;
  rating: number | null;
  tags: string[] | null;
  journal_note: string | null;
};

export default async function JournalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { id } = await params;

  const journalId = Number(id);

  if (!Number.isInteger(journalId)) {
    notFound();
  }

  // Find out who is logged in.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Nobody is logged in.
  if (!user) {
    return (
      <main className="relative min-h-screen bg-[#151313] px-6 pb-16 pt-32 text-[#F5EEE6]">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#E8A0A8]">
            Reel Talk
          </p>

          <h1 className="mt-3 text-4xl font-bold">
            Journal
          </h1>

          <div className="mt-10 rounded-2xl border border-[#3A3432] bg-[#211D1C] p-8">
            <p className="text-[#B8AEA8]">
              You need to be logged in to open this journal.
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

  // Load this specific journal.
  //
  // Our RLS policies decide whether the logged-in user is
  // allowed to see it. That means this works for journals
  // they own AND journals shared with them.
  const {
    data: journalData,
    error: journalError,
  } = await supabase
    .from("journals")
    .select(
      "id, owner_id, name, description, visibility, cover_style"
    )
    .eq("id", journalId)
    .maybeSingle();

  if (journalError) {
    return (
      <main className="relative min-h-screen bg-[#151313] px-6 pb-16 pt-32 text-[#F5EEE6]">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/journal"
            className="text-sm font-semibold text-[#E8A0A8] transition hover:opacity-80"
          >
            ← Back to Journals
          </Link>

          <div className="mt-8 rounded-2xl border border-[#E8A0A8]/30 bg-[#E8A0A8]/10 p-5">
            <p className="text-sm text-[#F2B6BD]">
              We couldn't load this journal:{" "}
              {journalError.message}
            </p>
          </div>
        </div>
      </main>
    );
  }

  // If the journal does not exist OR RLS does not allow this
  // user to see it, treat it as not found.
  if (!journalData) {
    notFound();
  }

  const journal = journalData as Journal;

  // Load ONLY finished tickets belonging to this journal.
  const {
    data: entryData,
    error: entryError,
  } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("journal_id", journal.id)
    .eq("status", "finished")
    .order("created_at", {
      ascending: false,
    });

  const entries =
    (entryData as JournalEntry[] | null) ?? [];

  const isOwner = journal.owner_id === user.id;

  return (
    <main className="relative min-h-screen bg-[#151313] px-6 pb-16 pt-32 text-[#F5EEE6]">
      <div className="mx-auto max-w-6xl">
        {/* BACK TO JOURNAL SHELF */}
        <Link
          href="/journal"
          className="text-sm font-semibold text-[#E8A0A8] transition hover:opacity-80"
        >
          ← Back to Journals
        </Link>

        {/* JOURNAL HEADER */}
        <header className="mt-8">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#E8A0A8]">
              Reel Talk Journal
            </p>

            <span className="rounded-full border border-[#3A3432] bg-[#211D1C] px-3 py-1 text-xs font-semibold text-[#B8AEA8]">
              {journal.visibility === "shared"
                ? "Shared Journal"
                : "Private Journal"}
            </span>

            {!isOwner && (
              <span className="rounded-full border border-[#3A3432] bg-[#211D1C] px-3 py-1 text-xs font-semibold text-[#B8AEA8]">
                Shared with you
              </span>
            )}
          </div>

          <h1 className="mt-3 text-5xl font-bold">
            {journal.name}
          </h1>

          {journal.description ? (
            <p className="mt-3 max-w-2xl leading-7 text-[#B8AEA8]">
              {journal.description}
            </p>
          ) : (
            <p className="mt-3 text-[#817774]">
              A little collection of movie nights,
              memories, and things worth keeping.
            </p>
          )}
        </header>

        {/* TICKET DATABASE ERROR */}
        {entryError && (
          <div className="mt-10 rounded-2xl border border-[#E8A0A8]/30 bg-[#E8A0A8]/10 p-5">
            <p className="text-sm text-[#F2B6BD]">
              We couldn't load the tickets in this
              journal: {entryError.message}
            </p>
          </div>
        )}

        {/* EMPTY JOURNAL */}
        {!entryError && entries.length === 0 && (
          <div className="relative mt-12 max-w-xl rotate-[-1deg] bg-[#F1DFCC] p-8 text-[#211B19] shadow-xl">
            <div className="absolute -top-4 left-1/2 h-8 w-28 -translate-x-1/2 rotate-2 bg-[#D9B7AD]/80" />

            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#8A6D64]">
              {journal.name}
            </p>

            <h2 className="mt-3 text-2xl font-bold">
              Nothing on the page yet 🎞️
            </h2>

            <p className="mt-3 leading-7 text-[#665A55]">
              Finish a movie or show and save its
              ticket to this journal.
            </p>

            <Link
              href="/"
              className="mt-6 inline-block rounded-lg bg-[#211B19] px-5 py-3 font-bold text-[#F1DFCC]"
            >
              Find Something to Watch
            </Link>
          </div>
        )}

        {/* SAVED JOURNAL TICKETS */}
        {!entryError && entries.length > 0 && (
          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            {entries.map((entry) => {
              const posterUrl = entry.poster_path
                ? `https://image.tmdb.org/t/p/w500${entry.poster_path}`
                : null;

              const ticketNumber = String(
                entry.id
              ).padStart(4, "0");

              const watchedDate = entry.watched_date
                ? new Date(
                    `${entry.watched_date}T00:00:00`
                  ).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "No date";

              return (
                <article
                  key={entry.id}
                  className="relative overflow-hidden rounded-sm bg-[#F1DFCC] text-[#211B19] shadow-xl"
                >
                  {/* SCRAPBOOK TAPE */}
                  <div className="absolute -top-2 left-8 z-10 h-8 w-24 -rotate-3 bg-[#D9B7AD]/80" />

                  <div className="flex min-h-[330px]">
                    {/* MAIN TICKET */}
                    <div className="flex-1 p-6">
                      <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#8A6D64]">
                        Reel Talk • Admit One
                      </p>

                      <div className="mt-5 flex gap-5">
                        {/* POSTER */}
                        <div className="w-28 shrink-0">
                          {posterUrl ? (
                            <img
                              src={posterUrl}
                              alt={`${entry.title} poster`}
                              className="w-full rounded-md object-cover shadow-md"
                            />
                          ) : (
                            <div className="flex aspect-[2/3] items-center justify-center rounded-md bg-[#D9C8B6] p-2 text-center text-xs">
                              No Poster
                            </div>
                          )}
                        </div>

                        {/* TICKET INFO */}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold uppercase tracking-widest text-[#A05F68]">
                            Watched
                          </p>

                          <h2 className="mt-1 text-2xl font-black leading-tight">
                            {entry.title}
                          </h2>

                          <p className="mt-1 text-sm text-[#74645D]">
                            {entry.year}
                          </p>

                          <div className="mt-5">
                            <p className="text-xs font-bold uppercase tracking-wider text-[#8A6D64]">
                              Date
                            </p>

                            <p className="mt-1 font-semibold">
                              {watchedDate}
                            </p>
                          </div>

                          {entry.watched_time && (
                            <div className="mt-3">
                              <p className="text-xs font-bold uppercase tracking-wider text-[#8A6D64]">
                                Time
                              </p>

                              <p className="mt-1 font-semibold">
                                {entry.watched_time.slice(
                                  0,
                                  5
                                )}
                              </p>
                            </div>
                          )}

                          <div className="mt-4">
                            <span className="text-2xl text-[#A05F68]">
                              ★
                            </span>

                            <span className="ml-2 text-xl font-black">
                              {entry.rating?.toFixed(1) ??
                                "0.0"}
                            </span>

                            <span className="text-[#74645D]">
                              {" "}
                              / 5
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* TAGS */}
                      {entry.tags &&
                        entry.tags.length > 0 && (
                          <div className="mt-5 flex flex-wrap gap-2">
                            {entry.tags.map((tag) => (
                              <span
                                key={tag}
                                className="-rotate-1 rounded-full bg-[#D9B7AD] px-3 py-1 text-xs font-bold"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                      {/* JOURNAL NOTE */}
                      {entry.journal_note && (
                        <div className="mt-5 border-t border-dashed border-[#A9988E] pt-4">
                          <p className="text-xs font-bold uppercase tracking-wider text-[#8A6D64]">
                            From the Journal
                          </p>

                          <p className="mt-2 leading-6 text-[#594C47]">
                            “{entry.journal_note}”
                          </p>
                        </div>
                      )}
                    </div>

                    {/* TEAR-OFF STUB */}
                    <div className="relative hidden w-28 shrink-0 border-l-2 border-dashed border-[#B8A698] sm:flex sm:flex-col sm:items-center sm:justify-between sm:py-6">
                      <div className="rotate-90 whitespace-nowrap text-xs font-black uppercase tracking-[0.25em] text-[#8A6D64]">
                        Reel Talk
                      </div>

                      <div className="text-center">
                        <p className="text-2xl">
                          🎟️
                        </p>

                        <p className="mt-2 text-xs font-black">
                          #{ticketNumber}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}