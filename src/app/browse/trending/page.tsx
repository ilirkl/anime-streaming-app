import { animeServer } from "@/lib/anime-server";
import { AnimeCard } from "@/components/anime/AnimeCard";
import { Metadata } from "next";
import { Pagination } from "@/components/ui/pagination";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Trending Anime | Anime Streaming App",
  description: "Browse the most popular and trending anime series and movies.",
};

interface TrendingPageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function TrendingPage({ searchParams }: TrendingPageProps) {
  const resolvedSearchParams = await searchParams;
  const page = resolvedSearchParams.page ? parseInt(resolvedSearchParams.page) : 1;
  const limit = 24; // Show more items on the dedicated page

  // Get trending anime with pagination
  const { data: trendingAnime, count } = await animeServer.getTrendingAnime(limit, page);
  const totalPages = count ? Math.ceil(count / limit) : 1;

  return (
    <div className="container max-w-full py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/browse">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trending Anime</h1>
          <p className="text-muted-foreground">
            Discover the most popular anime series right now
          </p>
        </div>
      </div>

      {trendingAnime.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 3xl:grid-cols-8 gap-1 sm:gap-2 md:gap-3">
            {trendingAnime.map((anime) => (
              <AnimeCard
                key={anime.id}
                anime={{
                  id: anime.id,
                  title: anime.title,
                  coverImage: anime.cover_image || '/placeholder-cover.jpg',
                  synopsis: anime.synopsis,
                  status: anime.status
                }}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                baseUrl="/browse/trending"
              />
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <h2 className="text-xl font-semibold mb-2">No trending anime found</h2>
          <p className="text-muted-foreground mb-6">
            Check back later for trending anime series and movies.
          </p>
          <Button asChild>
            <Link href="/browse">Browse All Anime</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
