'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
// Removed unused AnimeCard import
import Image from 'next/image';
import { GENRES } from '@/lib/constants/genres';
import { slugify } from '@/lib/utils';

// Define the top anime type
type TopAnime = {
  id: string;
  title: string;
  coverImage: string;
  rank?: number;
};

// Define the watch history item type
type WatchHistoryItem = {
  id: string;
  episode: {
    number: number;
    season: {
      number: number;
      anime: {
        id: string;
        title: string;
        cover_image: string;
      };
    };
  };
};

interface DashboardSidebarProps {
  topAnime: TopAnime[];
  watchHistory?: WatchHistoryItem[];
  isAuthenticated?: boolean;
}

export function DashboardSidebar({ topAnime, watchHistory = [], isAuthenticated = false }: DashboardSidebarProps) {
  const [showAllGenres, setShowAllGenres] = useState(false);
  const displayedGenres = showAllGenres ? GENRES : GENRES.slice(0, 12);

  return (
    <div className="space-y-6 lg:space-y-8 sticky top-4 w-full">
      {/* Genres Section */}
      <section className="bg-card rounded-lg p-4 xl:p-5 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Genres</h2>
          <div className="flex items-center gap-2">
            <Link href="/genres" className="text-xs text-primary hover:text-primary/80">
              View all
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllGenres(!showAllGenres)}
              className="text-xs text-primary hover:text-primary/80 p-0 h-auto"
            >
              {showAllGenres ? 'Show less' : 'Show more'}
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 xl:gap-3">
          {displayedGenres.map((genre) => (
            <Link
              key={genre.slug}
              href={`/genres/${genre.slug}`}
              className="px-2 py-1.5 text-sm rounded-md bg-muted hover:bg-muted/80 transition text-center"
            >
              {genre.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Continue Watching Section - Only shown for authenticated users */}
      {isAuthenticated && (
        <section className="bg-card rounded-lg p-4 xl:p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Continue Watching</h2>
            <Link href="/user?tab=history" className="text-xs text-primary hover:text-primary/80">
              View all
            </Link>
          </div>

          {watchHistory.length > 0 ? (
            <div className="space-y-3">
              {watchHistory.map((item) => {
                const animeTitle = item.episode.season.anime.title;
                const animeSlug = slugify(animeTitle);
                const episodeNumber = item.episode.number;
                const seasonNumber = item.episode.season.number;

                return (
                  <Link
                    key={item.id}
                    href={`/watch/${animeSlug}/s${seasonNumber}/e${episodeNumber}`}
                    className="flex items-center gap-3 group hover:bg-muted/50 p-1 rounded-md transition"
                  >
                    <div className="relative flex-shrink-0 w-10 h-14 bg-muted rounded overflow-hidden">
                      {item.episode.season.anime.cover_image && (
                        <Image
                          src={item.episode.season.anime.cover_image}
                          alt={animeTitle}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium line-clamp-1 group-hover:text-primary transition">
                        {animeTitle}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        S{seasonNumber} E{episodeNumber}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center p-3 bg-muted/30 rounded-md">
              <p className="text-xs text-muted-foreground">No watch history yet</p>
            </div>
          )}
        </section>
      )}

      {/* Top 10 Anime Section */}
      <section className="bg-card rounded-lg p-4 xl:p-5 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Top 10</h2>
          <Link href="/browse/top" className="text-xs text-primary hover:text-primary/80">
            View all
          </Link>
        </div>
        <div className="space-y-3">
          {topAnime.map((anime, index) => (
            <Link
              key={anime.id}
              href={`/anime/${anime.id}`}
              className="flex items-center gap-3 group hover:bg-muted/50 p-1 rounded-md transition"
            >
              <div className="relative flex-shrink-0 w-10 h-14 bg-muted rounded overflow-hidden">
                <span className="absolute top-0 left-0 bg-primary text-primary-foreground text-xs font-bold w-5 h-5 flex items-center justify-center z-10">
                  {index + 1}
                </span>
                {anime.coverImage && (
                  <Image
                    src={anime.coverImage}
                    alt={anime.title}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                )}
              </div>
              <span className="text-sm font-medium line-clamp-2 group-hover:text-primary transition">
                {anime.title}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
