"use client";

import { useState } from "react";
import Link from "next/link";

type SearchResult = {
  id: number;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  media_type: string;
  poster_path?: string | null;
};

export default function SearchBar() {
  const [search, setSearch] = useState<string>("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  async function handleSearch(
    event: React.SubmitEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (search.trim() === "") {
      setError("Give us a movie or show title first!");
      setResults([]);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/search?query=${encodeURIComponent(search.trim())}`
      );

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();

      const moviesAndShows = data.results.filter(
        (item: SearchResult) =>
          item.media_type === "movie" || item.media_type === "tv"
      );

      setResults(moviesAndShows);
    } catch {
      setError("Something went wrong while searching. Try again!");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-8 w-full max-w-5xl">

      {/* Search bar */}
      <form onSubmit={handleSearch} className="mx-auto flex max-w-xl">
        <input
          type="text"
          placeholder="Search for a movie or show..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full rounded-l-xl bg-[#242020] px-5 py-3 outline-none"
        />

        <button
          type="submit"
          className="rounded-r-xl bg-[#E8A0A8] px-6 py-3 font-semibold text-[#151313]"
        >
          Search
        </button>
      </form>

      {/* Loading message */}
      {loading && (
        <p className="mt-6 text-center text-[#B8AEA8]">
          Searching the reels...
        </p>
      )}

      {/* Error message */}
      {error && (
        <p className="mt-6 text-center text-[#E8A0A8]">
          {error}
        </p>
      )}

      {/* Search results */}
      {!loading && results.length > 0 && (
        <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {results.map((result) => {
            const title =
              result.title || result.name || "Unknown Title";

            const date =
              result.release_date || result.first_air_date;

            const year = date
              ? date.slice(0, 4)
              : "Unknown";

            const posterUrl = result.poster_path
              ? `https://image.tmdb.org/t/p/w300${result.poster_path}`
              : null;

            return (
              <Link
                key={`${result.media_type}-${result.id}`}
                href={`/title/${result.id}?type=${result.media_type}`}
                className="group min-w-0"
              >
                {/* Poster */}
                {posterUrl ? (
                  <img
                    src={posterUrl}
                    alt={`${title} poster`}
                    className="aspect-[2/3] w-full rounded-xl object-cover transition duration-200 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex aspect-[2/3] w-full items-center justify-center rounded-xl bg-[#242020] text-sm text-[#B8AEA8]">
                    No Poster
                  </div>
                )}

                {/* Title */}
                <h2 className="mt-3 truncate font-semibold">
                  {title}
                </h2>

                {/* Year + type */}
                <p className="mt-1 text-sm text-[#B8AEA8]">
                  {year} •{" "}
                  {result.media_type === "movie"
                    ? "Movie"
                    : "TV Show"}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}