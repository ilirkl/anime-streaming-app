import { animeServer } from "@/lib/anime-server";
import { AnimeCard } from "@/components/anime/AnimeCard";
import Link from "next/link";
import { GENRES } from "@/lib/constants/genres";
import { Button } from "@/components/ui/button";

export default async function BrowsePage() {
  const { data: latestEpisodes } = await animeServer.getLatestEpisodes(14);
  const { data: trendingAnime } = await animeServer.getTrendingAnime(7);

  // Filter first
  // @ts-expect-error - We know the structure from the database query
  const validLatestEpisodes = latestEpisodes.filter((ep) => ep.seasons?.animes?.id);

  // Map valid episodes
  const processedLatestEpisodes = validLatestEpisodes.map((ep) => ({
    // @ts-expect-error - We know the structure from the database query
    id: ep.seasons.animes.id, // Known to exist
    // @ts-expect-error - We know the structure from the database query
    title: ep.seasons.animes.title || 'Untitled Anime',
    // @ts-expect-error - We know the structure from the database query
    coverImage: ep.seasons.animes.cover_image || '/images/placeholder-cover.jpg',
    episodeId: ep.id,
    episodeNumber: ep.number,
    airDate: ep.air_date,
    // @ts-expect-error - We know the structure from the database query
    rating: ep.seasons.animes.rating, // Add rating here
  }));

  return (
    <div className="container max-w-full py-6 space-y-8">
      {/* Genres Section */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Genres</h2>
          <Button variant="link" size="sm" asChild>
            <Link href="/genres" className="text-sm text-primary">View all genres</Link>
          </Button>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {GENRES.slice(0, 12).map((genre) => (
            <Link
              key={genre.slug}
              href={`/genres/${genre.slug}`}
              className="p-3 text-center rounded-lg bg-muted hover:bg-muted/80 transition"
            >
              {genre.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Latest Episodes */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Latest Episodes</h2>
          <Link href="/browse/latest" className="text-sm text-primary">View all</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-1 sm:gap-2 md:gap-3">
          {processedLatestEpisodes.map((anime) => (
            anime.episodeId ? ( // Ensure key is valid
              <AnimeCard
                key={anime.episodeId}
                anime={anime}
                showEpisodeInfo
              />
            ) : null
          ))}
        </div>
      </section>

      {/* Trending Now */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Trending Now</h2>
          <Link href="/browse/trending" className="text-sm text-primary">View all</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-1 sm:gap-2 md:gap-3">
          {trendingAnime.map((anime) => (
            <AnimeCard
            key={anime.id}
            anime={{
              id: anime.id,
              title: anime.title,
              coverImage: anime.cover_image || '/placeholder-cover.jpg',
              rating: anime.rating, // Remove fallback, assuming it's fetched
              synopsis: anime.synopsis,
              status: anime.status,
              // Add types to reduce callback
              episodeCount: anime.seasons?.length > 0 ? anime.seasons.reduce((total: number, season: { episodes: Array<unknown> }) => total + season.episodes.length, 0) : 12
            }}
          />
          ))}
        </div>
      </section>
    </div>
  );
}
