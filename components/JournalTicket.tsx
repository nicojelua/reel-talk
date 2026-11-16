type JournalTicketProps = {
  title: string;
  posterUrl: string | null;
  year: string;
  watchedDate: string;
  watchedTime: string;
  rating: number;
  tags: string[];
  journalNote: string;
};

export default function JournalTicket({
  title,
  posterUrl,
  year,
  watchedDate,
  watchedTime,
  rating,
  tags,
  journalNote,
}: JournalTicketProps) {
  const formattedDate = new Date(
    `${watchedDate}T00:00:00`
  ).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const formattedTime = watchedTime
    ? new Date(`2000-01-01T${watchedTime}`).toLocaleTimeString(
        "en-US",
        {
          hour: "numeric",
          minute: "2-digit",
        }
      )
    : null;

  return (
    <div className="relative mt-10">

      {/* Scrapbook label */}
      <div className="absolute -top-4 left-8 z-10 -rotate-2 bg-[#E8A0A8] px-4 py-1 text-xs font-bold uppercase tracking-widest text-[#211B19] shadow-md">
        Movie Memory
      </div>

      {/* Ticket */}
      <div className="relative rotate-[0.4deg] overflow-hidden rounded-xl bg-[#F1DFCC] text-[#211B19] shadow-2xl">

        {/* Ticket heading */}
        <div className="flex items-center justify-between border-b border-[#CBB7A3] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.25em] opacity-60">
          <span>Reel Talk Cinema</span>
          <span>Admit One</span>
        </div>

        <div className="flex flex-col sm:flex-row">

          {/* Poster */}
          <div className="relative w-full shrink-0 p-5 sm:w-44">

            {/* Fake tape */}
            <div className="absolute left-1/2 top-2 z-10 h-6 w-20 -translate-x-1/2 -rotate-3 bg-[#D7C2A8]/80 shadow-sm" />

            {posterUrl ? (
              <img
                src={posterUrl}
                alt={`${title} poster`}
                className="-rotate-1 aspect-[2/3] w-full rounded-sm object-cover shadow-lg"
              />
            ) : (
              <div className="flex aspect-[2/3] w-full items-center justify-center bg-[#D7C4B0] text-sm">
                No Poster
              </div>
            )}
          </div>

          {/* Ticket information */}
          <div className="flex flex-1 flex-col px-6 py-6">

            {/* Watched stamp */}
            <div className="inline-block self-start rotate-[-3deg] rounded border-2 border-[#A85F64] px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-[#A85F64]">
              Watched ✓
            </div>

            {/* Movie */}
            <h2 className="mt-5 text-3xl font-black leading-tight">
              {title}
            </h2>

            <p className="mt-1 text-sm opacity-60">
              {year}
            </p>

            {/* Date */}
            <div className="mt-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] opacity-50">
                Date Watched
              </p>

              <p className="mt-1 font-bold">
                {formattedDate}
                {formattedTime && ` • ${formattedTime}`}
              </p>
            </div>

            {/* Rating */}
            {rating > 0 && (
              <div className="mt-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] opacity-50">
                  My Rating
                </p>

                <p className="mt-1 text-lg font-black">
                  ★ {rating} / 5
                </p>
              </div>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="-rotate-1 rounded-full bg-[#D9B7AD] px-3 py-1 text-xs font-semibold"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Journal note */}
            {journalNote.trim() !== "" && (
              <div className="mt-6 rotate-[-0.5deg] border-l-2 border-[#A85F64] pl-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] opacity-50">
                  From My Journal
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm italic leading-6">
                  “{journalNote}”
                </p>
              </div>
            )}

          </div>

          {/* Tear-off stub */}
          <div className="relative flex min-h-32 items-center justify-center border-t-2 border-dashed border-[#B9A48F] px-6 py-5 sm:w-28 sm:border-l-2 sm:border-t-0">

            <div className="absolute -left-3 -top-3 hidden h-6 w-6 rounded-full bg-[#151313] sm:block" />

            <div className="absolute -bottom-3 -left-3 hidden h-6 w-6 rounded-full bg-[#151313] sm:block" />

            <div className="text-center sm:rotate-90">
              <p className="whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.3em] opacity-50">
                Admit One
              </p>

              <p className="mt-2 whitespace-nowrap text-xs font-black">
                REEL TALK
              </p>

              <p className="mt-1 whitespace-nowrap text-[9px] opacity-50">
                🎟 #0001
              </p>
            </div>

          </div>
        </div>

        {/* Bottom ticket text */}
        <div className="flex justify-between border-t border-[#CBB7A3] px-6 py-3 text-[9px] font-semibold uppercase tracking-[0.2em] opacity-40">
          <span>Movies end.</span>
          <span>The conversation doesn&apos;t.</span>
        </div>

      </div>

      {/* Scrapbook note */}
      <p className="ml-5 mt-3 rotate-[-1deg] text-sm italic text-[#B8AEA8]">
        another one for the journal ♡
      </p>

    </div>
  );
}