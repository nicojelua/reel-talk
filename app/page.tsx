import SearchBar from "@/components/SearchBar";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#151313] text-[#F5EEE6]">
      <section className="flex flex-col items-center px-6 pt-40 pb-16">
        <h1 className="text-6xl font-bold tracking-tight">
          REEL TALK
        </h1>

        <p className="mt-4 text-lg text-[#B8AEA8]">
          Movies end. The conversation doesn't.
        </p>

        <SearchBar />
      </section>
    </main>
  );
}