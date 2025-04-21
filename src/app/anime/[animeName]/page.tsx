import { animeServer } from "@/lib/anime-server";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { slugify } from "@/lib/utils";
import { notFound } from "next/navigation";
import { AddToWatchlistButton } from "@/components/anime/AddToWatchlistButton";
import { TruncatedSynopsis } from "@/components/anime/TruncatedSynopsis";
import { getUser } from "@/lib/server";

interface AnimePageProps {
  params: Promise<{
    animeName: string;
  }>;
}

export default async function AnimePage({ params }: AnimePageProps) {
  const resolvedParams = await params;

  // Get anime by slug
  const animeDetails = await animeServer.getAnimeBySlug(resolvedParams.animeName);

  if (!animeDetails) {
    notFound();
  }

  const seasons = await animeServer.getSeasons(animeDetails.id);
  const firstSeason = seasons[0];
  const episodes = firstSeason ? await animeServer.getEpisodes(firstSeason.id) : [];

  // Create a slug from the anime title
  const animeSlug = slugify(animeDetails.title);

  // Check if the anime is in the user's watchlist
  const user = await getUser();
  let isInWatchlist = false;
  let watchlistItemId: string | undefined;

  if (user) {
    const supabase = await import('@/lib/server').then(mod => mod.createClient());
    const { data } = await supabase
      .from('watchlist')
      .select('id')
      .eq('user_id', user.id)
      .eq('anime_id', animeDetails.id)
      .maybeSingle();

    if (data) {
      isInWatchlist = true;
      watchlistItemId = data.id;
    }
  }

  return (
    <div className="container max-w-full py-6">
      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        {/* Left side: Cover image and action buttons */}
        <div className="w-full md:w-1/3 lg:w-1/4 flex flex-col gap-4">
          <AspectRatio ratio={3/4} className="bg-muted rounded-lg overflow-hidden">
            {animeDetails.cover_image ? (
              <Image
                src={animeDetails.cover_image}
                alt={animeDetails.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                priority
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-muted">
                <span className="text-muted-foreground">No Image</span>
              </div>
            )}
          </AspectRatio>

          <div className="flex gap-2">
            {episodes.length > 0 && (
              <Button className="flex-1" asChild>
                <Link href={`/watch/${animeSlug}/s${firstSeason.number}/e1`}>
                  <Play className="mr-2 h-4 w-4" /> Watch Now
                </Link>
              </Button>
            )}
            <AddToWatchlistButton
              animeId={animeDetails.id}
              isInWatchlist={isInWatchlist}
              watchlistItemId={watchlistItemId}
              variant="outline"
              redirectPath={`/anime/${animeSlug}`}
            />
          </div>
        </div>

        {/* Right side: Anime details and episodes */}
        <div className="flex-1">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            <div className="flex-1">
              <div className="space-y-4">
                <h1 className="text-2xl md:text-3xl font-bold">{animeDetails.title}</h1>

                {animeDetails.original_title && (
                  <p className="text-muted-foreground">{animeDetails.original_title}</p>
                )}

                <div className="flex flex-wrap gap-2">
                  <div className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                    {animeDetails.status}
                  </div>
                  {animeDetails.age_rating && (
                    <div className="px-2 py-1 bg-muted rounded text-xs">
                      {animeDetails.age_rating}
                    </div>
                  )}
                  {episodes.length > 0 && episodes[0].duration && (
                    <div className="px-2 py-1 bg-muted rounded text-xs">
                      {episodes[0].duration} min runtime
                    </div>
                  )}
                </div>

                {animeDetails.synopsis && (
                  <TruncatedSynopsis text={animeDetails.synopsis} />
                )}
              </div>
            </div>
            {/* Trailer */}
            {animeDetails.trailer_url && (
              <div className="w-full md:w-1/2 aspect-video rounded-lg overflow-hidden">
                <iframe
                  width="560"
                  height="315"
                  src={animeDetails.trailer_url}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                ></iframe>
              </div>
            )}
          </div>
          {/* Episodes List */}
          <div className="mt-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">Episodes</h2>
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 4xl:grid-cols-7 gap-3 md:gap-4">
              {episodes.map((episode) => (
                <Link
                  key={episode.id}
                  href={`/watch/${animeSlug}/s${firstSeason.number}/e${episode.number}`}
                  className="group relative aspect-video bg-muted rounded-lg overflow-hidden"
                >
                  {episode.thumbnail ? (
                    <Image
                      src={episode.thumbnail}
                      alt={`Episode ${episode.number}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted">
                      <span className="text-muted-foreground">No Preview</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="h-10 w-10 md:h-12 md:w-12" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/80">
                    <p className="text-sm">Episode {episode.number}</p>
                    {episode.title && (
                      <p className="text-xs text-muted-foreground truncate">{episode.title}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
