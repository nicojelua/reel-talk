export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query) {
    return Response.json(
      { error: "Please enter a movie or show title." },
      { status: 400 }
    );
  }

  const response = await fetch(
    `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(query)}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_API_TOKEN}`,
        accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    return Response.json(
      { error: "Something went wrong while searching TMDB." },
      { status: 500 }
    );
  }

  const data = await response.json();

  return Response.json(data);
}