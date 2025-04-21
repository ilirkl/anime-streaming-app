import { AnimeCard } from "@/components/anime/AnimeCard";
import Link from "next/link";

// Define the type for search result items
type SearchResultItem = {
  id: string;
  title: string;
  cover_image: string | null;
  synopsis: string | null;
  status: string | null;
};

interface SearchResultsProps {
  results: SearchResultItem[]; // Use the defined type
  query: string;
  count: number;
  page: number;
  totalPages: number;
}

export function SearchResults({ results, query, count, page, totalPages }: SearchResultsProps) {
  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">
          No results found for &quot;{query}&quot;. Try a different search term.
        </p>
      </div>
    );
  }

  return (
    <>
      <p className="text-muted-foreground">
        Found {count} results for &quot;{query}&quot;
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 3xl:grid-cols-8 4xl:grid-cols-9 gap-1 sm:gap-2 md:gap-3">
        {results.map((anime) => (
          <AnimeCard
            key={anime.id}
            anime={{
              id: anime.id,
              title: anime.title,
              coverImage: anime.cover_image || '/placeholder-cover.jpg',
              synopsis: anime.synopsis ?? undefined, // Convert null to undefined
              status: anime.status ?? undefined // Convert null to undefined
            }}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex space-x-2">
            {page > 1 && (
              <Link
                href={`/search?q=${encodeURIComponent(query)}&page=${page - 1}`}
                className="px-4 py-2 rounded-md bg-muted hover:bg-muted/80 transition"
              >
                Previous
              </Link>
            )}

            <span className="px-4 py-2">
              Page {page} of {totalPages}
            </span>

            {page < totalPages && (
              <Link
                href={`/search?q=${encodeURIComponent(query)}&page=${page + 1}`}
                className="px-4 py-2 rounded-md bg-muted hover:bg-muted/80 transition"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}
