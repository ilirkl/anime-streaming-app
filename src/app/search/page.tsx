import { animeServer } from "@/lib/anime-server";
import { Metadata } from "next";
import { SearchForm } from "@/components/search/SearchForm";
import { SearchEmptyState } from "@/components/search/SearchEmptyState";
import { SearchResults } from "@/components/search/SearchResults";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
  }>;
}

export const metadata: Metadata = {
  title: "Search Anime | Anime Streaming App",
  description: "Search for your favorite anime series and movies",
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q || '';
  const page = resolvedSearchParams.page ? parseInt(resolvedSearchParams.page) : 1;
  const limit = 24;

  // If no query, show empty search page
  if (!query) {
    return (
      <div className="container max-w-full py-6 space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Search Anime</h1>
        <SearchForm initialQuery="" />
        <SearchEmptyState />
      </div>
    );
  }

  // Search for anime
  const { data: searchResults, count } = await animeServer.searchAnime(query, limit, page);
  const totalCount = count || 0; // Ensure count is a number
  const totalPages = count ? Math.ceil(count / limit) : 1;

  return (
    <div className="container max-w-full py-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Search Results</h1>

      <SearchForm initialQuery={query} />

      <SearchResults
        results={searchResults}
        query={query}
        count={totalCount}
        page={page}
        totalPages={totalPages}
      />
    </div>
  );
}
