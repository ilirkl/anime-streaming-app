import { animeServer } from "@/lib/anime-server";
import { AnimeCard } from "@/components/anime/AnimeCard";
// Removed unused Button import
import Link from "next/link";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { FeaturedAnimeSlider } from "@/components/anime/FeaturedAnimeSlider";

// Define the processed anime type to match AnimeCard props
type ProcessedAnime = {
  id: string;
  title: string;
  coverImage: string;
  episodeNumber?: number;
  episodeId?: string;
  synopsis?: string;
  airDate?: string;
  status?: string;
}

interface DashboardContentProps {
  isPublic: boolean;
  userId?: string;
}

export async function DashboardContent({ isPublic, userId }: DashboardContentProps) {
  const { data: latestEpisodes } = await animeServer.getLatestEpisodes(7);
  const { data: trendingAnime } = await animeServer.getTrendingAnime(7);
  const { data: featuredAnime } = await animeServer.getTrendingAnime(5); // Get top 5 trending anime for the slider
  const topAnime = await animeServer.getTopAnime(10);

  // Get watch history for authenticated users
  let watchHistory = [];
  if (!isPublic && userId) {
    watchHistory = await animeServer.getWatchHistory(userId, 6);
  }

  // Filter first to ensure necessary data exists
  // @ts-expect-error - We know the structure from the database query
  const validLatestEpisodes = latestEpisodes.filter((ep) => ep.seasons?.animes?.id);

  // Process the valid latest episodes data
  const processedLatestEpisodes = validLatestEpisodes.map((ep): ProcessedAnime => ({
    // @ts-expect-error - We know the structure from the database query
    id: ep.seasons.animes.id, // Known to exist
    episodeId: ep.id,
    // @ts-expect-error - We know the structure from the database query
    title: ep.seasons?.animes?.title || 'Unknown Anime',
    // @ts-expect-error - We know the structure from the database query
    coverImage: ep.seasons?.animes?.cover_image || '/images/placeholder-cover.jpg',
    episodeNumber: ep.number,
    airDate: ep.air_date,
    synopsis: ep.synopsis,
    // @ts-expect-error - We know the structure from the database query
    status: ep.seasons.animes.status,
    // rating is not part of ProcessedAnime, remove or add to type if needed
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_180px] xl:grid-cols-[1fr_200px] 2xl:grid-cols-[1fr_220px] 3xl:grid-cols-[1fr_240px] gap-3 lg:gap-4 w-full">
      {/* Main Content */}
      <div className="space-y-6 sm:space-y-8">
        {/* Featured Anime Slider - visible on all screen sizes */}
        <div className="block">
          <FeaturedAnimeSlider
            animeList={featuredAnime.map(anime => ({
              id: anime.id,
              title: anime.title,
              coverImage: anime.cover_image || '/images/placeholder-cover.jpg',
              bannerImage: anime.banner_image || anime.cover_image || '/images/placeholder-cover.jpg',
              synopsis: anime.synopsis,
              rating: anime.rating || '8.7',
              runtime: anime.runtime || '24m',
              releaseYear: anime.release_date ? new Date(anime.release_date).getFullYear().toString() : '2023',
              status: anime.status || 'Ongoing'
            }))}
          />
        </div>

        {/* Latest Episodes */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl sm:text-2xl font-semibold">Latest Episodes</h2>
            <Link href="/browse/latest" className="text-sm text-primary">View all</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 3xl:grid-cols-8 4xl:grid-cols-9 gap-1 sm:gap-2 md:gap-3">
            {processedLatestEpisodes.map((anime) => (
              <AnimeCard
                key={anime.episodeId}
                anime={anime}
                showEpisodeInfo
              />
            ))}
          </div>
        </section>

        {/* Trending Now */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl sm:text-2xl font-semibold">Trending Now</h2>
            <Link href="/browse/trending" className="text-sm text-primary">View all</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 3xl:grid-cols-8 4xl:grid-cols-9 gap-1 sm:gap-2 md:gap-3">
            {trendingAnime.map((anime) => (
              <AnimeCard
                key={anime.id}
                anime={{
                  id: anime.id,
                  title: anime.title,
                  coverImage: anime.cover_image || '/placeholder-cover.jpg',
                  rating: anime.rating || '8.7', // Assuming rating exists on trendingAnime data
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

      {/* Sidebar */}
      <div className="w-full">
        <DashboardSidebar
          topAnime={topAnime.map(anime => ({
            id: anime.id,
            title: anime.title,
            coverImage: anime.cover_image || '/placeholder-cover.jpg'
            // Removed rating as it's not expected by DashboardSidebar's TopAnime type
          }))}
          watchHistory={watchHistory}
          isAuthenticated={!isPublic}
        />
      </div>
    </div>
  );
}
