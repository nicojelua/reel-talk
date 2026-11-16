import TitleActions from "@/components/TitleActions";

type TitlePageProps = {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    type?: string;
  }>;
};

type Genre = {
  id: number;
  name: string;
};

type CastMember = {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
};

type TitleDetails = {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  runtime?: number;
  episode_run_time?: number[];
  genres: Genre[];

  credits?: {
    cast: CastMember[];
  };
};

export default async function TitlePage({
  params,
  searchParams,
}: TitlePageProps) {
  const { id } = await params;
  const { type } = await searchParams;

  const mediaType = type === "tv" ? "tv" : "movie";

  const response = await fetch(
    `https://api.themoviedb.org/3/${mediaType}/${id}?append_to_response=credits`,
    {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_API_TOKEN}`,
        accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#151313] text-[#F5EEE6]">
        <p>We couldn't find this title.</p>
      </main>
    );
  }

  const title: TitleDetails = await response.json();

  const displayTitle =
    title.title || title.name || "Unknown Title";

  const date =
    title.release_date || title.first_air_date;

  const year = date
    ? date.slice(0, 4)
    : "Unknown";

  const runtime =
    title.runtime || title.episode_run_time?.[0];

  const posterUrl = title.poster_path
    ? `https://image.tmdb.org/t/p/w500${title.poster_path}`
    : null;

  const cast =
    title.credits?.cast.slice(0, 6) || [];

  return (
    <main className="min-h-screen bg-[#151313] px-6 py-16 text-[#F5EEE6]">
      <div className="mx-auto max-w-5xl">

        {/* Main title information */}
        <div className="flex flex-col gap-10 md:flex-row">

          {/* Poster */}
          <div className="w-full md:w-80">
            {posterUrl ? (
              <img
                src={posterUrl}
                alt={`${displayTitle} poster`}
                className="w-full rounded-2xl object-cover"
              />
            ) : (
              <div className="flex aspect-[2/3] items-center justify-center rounded-2xl bg-[#242020] text-[#B8AEA8]">
                No Poster
              </div>
            )}
          </div>

          {/* Movie / TV information */}
          <div className="flex flex-1 flex-col justify-center">

            {/* Media type */}
            <p className="text-sm uppercase tracking-widest text-[#E8A0A8]">
              {mediaType === "movie"
                ? "Movie"
                : "TV Show"}
            </p>

            {/* Title */}
            <h1 className="mt-2 text-5xl font-bold">
              {displayTitle}
            </h1>

            {/* Year and runtime */}
            <p className="mt-3 text-[#B8AEA8]">
              {year}
              {runtime
                ? ` • ${runtime} min`
                : ""}
            </p>

            {/* Genres */}
            <div className="mt-5 flex flex-wrap gap-2">
              {title.genres.map((genre) => (
                <span
                  key={genre.id}
                  className="rounded-full bg-[#242020] px-3 py-1 text-sm text-[#B8AEA8]"
                >
                  {genre.name}
                </span>
              ))}
            </div>

            {/* TMDB rating */}
            <p className="mt-6 text-lg">
              ★ {title.vote_average.toFixed(1)}

              <span className="ml-2 text-sm text-[#B8AEA8]">
                TMDB
              </span>
            </p>

            {/* Summary */}
            <p className="mt-6 max-w-2xl leading-7 text-[#D6CDC7]">
              {title.overview ||
                "No description available."}
            </p>

            {/* Reel Talk interactive controls */}
            <TitleActions
              tmdbId={title.id}
              mediaType={mediaType}
              title={displayTitle}
              posterPath={title.poster_path}
              posterUrl={posterUrl}
              year={year}
            />

          </div>
        </div>

        {/* Cast section */}
        {cast.length > 0 && (
          <section className="mt-16">

            <h2 className="text-2xl font-bold">
              Cast
            </h2>

            <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-6">

              {cast.map((person) => {
                const profileUrl =
                  person.profile_path
                    ? `https://image.tmdb.org/t/p/w300${person.profile_path}`
                    : null;

                return (
                  <div key={person.id}>

                    {/* Actor photo */}
                    {profileUrl ? (
                      <img
                        src={profileUrl}
                        alt={person.name}
                        className="aspect-[2/3] w-full rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex aspect-[2/3] items-center justify-center rounded-xl bg-[#242020] text-center text-sm text-[#B8AEA8]">
                        No Photo
                      </div>
                    )}

                    {/* Actor name */}
                    <p className="mt-3 font-semibold">
                      {person.name}
                    </p>

                    {/* Character */}
                    <p className="mt-1 text-sm text-[#B8AEA8]">
                      {person.character ||
                        "Unknown character"}
                    </p>

                  </div>
                );
              })}

            </div>
          </section>
        )}

      </div>
    </main>
  );
}