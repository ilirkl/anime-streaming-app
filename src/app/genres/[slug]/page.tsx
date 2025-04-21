import { animeServer } from "@/lib/anime-server";
import { GENRES } from "@/lib/constants/genres";
import { AnimeCard } from "@/components/anime/AnimeCard";
import { Metadata } from "next";
import { notFound } from "next/navigation";

interface GenrePageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
}

export async function generateMetadata({ params }: GenrePageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const genre = GENRES.find((g) => g.slug === resolvedParams.slug);

  if (!genre) {
    return {
      title: "Genre Not Found",
    };
  }

  return {
    title: `${genre.name} Anime | Anime Streaming App`,
    description: genre.description || `Browse ${genre.name.toLowerCase()} anime series and movies.`,
  };
}

export default async function GenrePage({ params, searchParams }: GenrePageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const genre = GENRES.find((g) => g.slug === resolvedParams.slug);

  if (!genre) {
    notFound();
  }

  const page = resolvedSearchParams.page ? parseInt(resolvedSearchParams.page) : 1;
  const limit = 24;

  const { data: animeList, count } = await animeServer.getAnimeByGenre(resolvedParams.slug, limit, page);
  const totalPages = count ? Math.ceil(count / limit) : 1;

  return (
    <div className="container max-w-full py-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{genre.name} Anime</h1>
        {genre.description && (
          <p className="text-muted-foreground max-w-3xl">
            {genre.description}
          </p>
        )}
      </div>

      {animeList.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 3xl:grid-cols-8 4xl:grid-cols-9 gap-1 sm:gap-2 md:gap-3">
            {animeList.map((anime) => (
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex space-x-2">
                {page > 1 && (
                  <a
                    href={`/genres/${resolvedParams.slug}?page=${page - 1}`}
                    className="px-4 py-2 rounded-md bg-muted hover:bg-muted/80 transition"
                  >
                    Previous
                  </a>
                )}

                <span className="px-4 py-2">
                  Page {page} of {totalPages}
                </span>

                {page < totalPages && (
                  <a
                    href={`/genres/${resolvedParams.slug}?page=${page + 1}`}
                    className="px-4 py-2 rounded-md bg-muted hover:bg-muted/80 transition"
                  >
                    Next
                  </a>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            No anime found in this genre. Check back later!
          </p>
        </div>
      )}
    </div>
  );
}
