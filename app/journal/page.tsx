import Link from "next/link";
import CreateJournal from "@/components/CreateJournal";
import { createClient } from "@/lib/supabase/server";

type Journal = {
  id: number;
  created_at: string;
  owner_id: string;
  name: string;
  description: string | null;
  visibility: string;
  cover_style: string | null;
};

export default async function JournalPage() {
  const supabase = await createClient();

  // Find out who is currently logged in.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If nobody is logged in, ask them to log in.
  if (!user) {
    return (
      <main className="min-h-screen bg-[#151313] px-6 pb-16 pt-32 text-[#F5EEE6]">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#E8A0A8]">
            Reel Talk
          </p>

          <h1 className="mt-3 text-5xl font-bold">
            My Journals
          </h1>

          <div className="mt-10 rounded-2xl border border-[#3A3432] bg-[#211D1C] p-8">
            <p className="text-[#B8AEA8]">
              You need to be logged in to see your journals.
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

  // Load every journal this user is allowed to see.
  // Supabase RLS handles whether they own it
  // or are a member of it.
  const { data, error } = await supabase
    .from("journals")
    .select(
      "id, created_at, owner_id, name, description, visibility, cover_style"
    )
    .order("created_at", {
      ascending: false,
    });

  const journals = (data as Journal[] | null) ?? [];

  return (
    <main className="min-h-screen bg-[#151313] px-6 pb-20 pt-32 text-[#F5EEE6]">
      <div className="mx-auto max-w-6xl">
        {/* PAGE HEADER */}
        <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#E8A0A8]">
              Reel Talk
            </p>

            <h1 className="mt-3 text-5xl font-bold">
              My Journals
            </h1>

            <p className="mt-3 max-w-2xl text-[#B8AEA8]">
              Your collection of movie nights, comfort
              watches, marathons, memories, and everything
              worth keeping.
            </p>
          </div>

          {/* REAL CREATE JOURNAL COMPONENT */}
          <CreateJournal />
        </header>

        {/* DATABASE ERROR */}
        {error && (
          <div className="mt-10 rounded-2xl border border-[#E8A0A8]/30 bg-[#E8A0A8]/10 p-5">
            <p className="text-sm text-[#F2B6BD]">
              We couldn't load your journals:{" "}
              {error.message}
            </p>
          </div>
        )}

        {/* EMPTY JOURNAL SHELF */}
        {!error && journals.length === 0 && (
          <section className="mt-14">
            <div className="relative max-w-xl rotate-[-1deg] bg-[#F1DFCC] p-8 text-[#211B19] shadow-xl">
              {/* SCRAPBOOK TAPE */}
              <div className="absolute -top-4 left-1/2 h-8 w-28 -translate-x-1/2 rotate-2 bg-[#D9B7AD]/80" />

              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#8A6D64]">
                Your Journal Shelf
              </p>

              <h2 className="mt-3 text-2xl font-black">
                Your shelf is looking a little empty 📓
              </h2>

              <p className="mt-3 leading-7 text-[#665A55]">
                Create your first journal and start building
                a collection of movie and TV memories.
              </p>

              <p className="mt-5 text-sm font-semibold text-[#A05F68]">
                Try something like “Movie Nights,” “Comfort
                Movies,” or “Horror Marathon.”
              </p>
            </div>
          </section>
        )}

        {/* JOURNAL SHELF */}
        {!error && journals.length > 0 && (
          <section className="mt-14">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {journals.map((journal, index) => {
                const isOwner =
                  journal.owner_id === user.id;

                const rotation =
                  index % 3 === 0
                    ? "-rotate-1"
                    : index % 3 === 1
                      ? "rotate-1"
                      : "rotate-0";

                return (
                  <Link
                    key={journal.id}
                    href={`/journal/${journal.id}`}
                    className={`group relative block ${rotation} transition duration-200 hover:-translate-y-1 hover:rotate-0`}
                  >
                    {/* NOTEBOOK */}
                    <article className="relative min-h-[320px] overflow-hidden rounded-r-xl border-l-[14px] border-[#8C5E58] bg-[#E8D5C0] p-7 text-[#211B19] shadow-xl">
                      {/* NOTEBOOK SPINE LINES */}
                      <div className="absolute bottom-0 left-3 top-0 w-px bg-[#B48A80]/50" />
                      <div className="absolute bottom-0 left-6 top-0 w-px bg-[#B48A80]/30" />

                      {/* TAPE */}
                      <div className="absolute -top-2 right-8 h-8 w-24 rotate-3 bg-[#D9B7AD]/80" />

                      <div className="relative flex min-h-[265px] flex-col">
                        <div className="flex items-start justify-between gap-4">
                          <p className="text-xs font-black uppercase tracking-[0.25em] text-[#8A6D64]">
                            Reel Talk
                          </p>

                          <span className="rounded-full border border-[#A9988E] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#74645D]">
                            {journal.visibility === "shared"
                              ? "Shared"
                              : "Private"}
                          </span>
                        </div>

                        <div className="my-auto py-8">
                          <p className="text-4xl">
                            📓
                          </p>

                          <h2 className="mt-4 text-2xl font-black leading-tight">
                            {journal.name}
                          </h2>

                          {journal.description && (
                            <p className="mt-3 line-clamp-3 leading-6 text-[#665A55]">
                              {journal.description}
                            </p>
                          )}
                        </div>

                        <div className="border-t border-dashed border-[#A9988E] pt-4">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-xs font-bold uppercase tracking-wider text-[#8A6D64]">
                              {isOwner
                                ? "Your Journal"
                                : "Shared With You"}
                            </span>

                            <span className="text-sm font-black text-[#A05F68] transition group-hover:translate-x-1">
                              Open →
                            </span>
                          </div>
                        </div>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}