import { GENRES } from "@/lib/constants/genres";
import { Metadata } from "next";
import { GenreCard } from "@/components/genres/GenreCard";

export const metadata: Metadata = {
  title: "Anime Genres | Anime Streaming App",
  description: "Browse anime by genre - action, adventure, comedy, drama, fantasy, and more.",
};

export default function GenresPage() {
  return (
    <div className="container max-w-full py-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Anime Genres</h1>
        <p className="text-muted-foreground">
          Browse anime by genre to find your next favorite series
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-8 4xl:grid-cols-10 gap-4">
        {GENRES.map((genre) => (
          <GenreCard key={genre.slug} genre={genre} />
        ))}
      </div>
    </div>
  );
}
