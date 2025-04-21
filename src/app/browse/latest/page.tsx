import { animeServer } from "@/lib/anime-server";
import { AnimeCard } from "@/components/anime/AnimeCard";
import { Metadata } from "next";
import { Pagination } from "@/components/ui/pagination";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

// Removed the EpisodeWithAnime interface

export const metadata: Metadata = {
  title: "Latest Episodes | Anime Streaming App",
  description: "Browse the latest anime episodes released on our platform.",
};

interface LatestPageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function LatestPage({ searchParams }: LatestPageProps) {
  const resolvedSearchParams = await searchParams;
  const page = resolvedSearchParams.page ? parseInt(resolvedSearchParams.page) : 1;
  const limit = 24; // Show more items on the dedicated page

  // Get latest episodes with pagination
  const { data: latestEpisodes, count } = await animeServer.getLatestEpisodes(limit, page);

  // Calculate total pages
  const totalPages = count ? Math.ceil(count / limit) : 1;

  // Filter episodes to ensure they have the necessary associated anime data first
  // @ts-expect-error - We know the structure from the database query
  const validEpisodes = latestEpisodes.filter((ep) => ep.seasons?.animes?.id);

  // Process the valid episodes to get the format needed for AnimeCard
  const processedLatestEpisodes = validEpisodes.map((ep) => ({
    // Required AnimeCard props
    // @ts-expect-error - We know the structure from the database query
    id: ep.seasons.animes.id, // Known to exist from filter
    // @ts-expect-error - We know the structure from the database query
    title: ep.seasons.animes.title || 'Untitled Anime', // Provide fallback
    // @ts-expect-error - We know the structure from the database query
    coverImage: ep.seasons.animes.cover_image || '/images/placeholder-cover.jpg', // Provide fallback
    // Optional AnimeCard props derived from episode
    episodeNumber: ep.number,
    episodeId: ep.id, // The episode's own ID
    airDate: ep.air_date,
    // Other optional props (synopsis, status, rating, episodeCount) are not directly available here
  }));


  return (
    <div className="container max-w-full py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/browse">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Latest Episodes</h1>
          <p className="text-muted-foreground">
            Stay up to date with the newest anime episodes
          </p>
        </div>
      </div>

      {processedLatestEpisodes.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 3xl:grid-cols-8 gap-1 sm:gap-2 md:gap-3">
            {/* Ensure anime object has a valid episodeId for the key */}
            {processedLatestEpisodes.map((anime) => (
              anime.episodeId ? (
                <AnimeCard
                  key={anime.episodeId}
                  anime={anime}
                  showEpisodeInfo
                />
              ) : null // Or render a fallback/log error if episodeId is missing unexpectedly
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                baseUrl="/browse/latest"
              />
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <h2 className="text-xl font-semibold mb-2">No latest episodes found</h2>
          <p className="text-muted-foreground mb-6">
            Check back later for new episode releases.
          </p>
          <Button asChild>
            <Link href="/browse">Browse All Anime</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
