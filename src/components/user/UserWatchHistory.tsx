'use client';

import { useEffect, useState } from "react";
import { createClient } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Play, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/EmptyState";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { slugify } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface UserWatchHistoryProps {
  userId: string;
}

interface WatchHistoryItem {
  id: string;
  watched_at: string;
  progress: number;
  completed: boolean;
  episode: {
    id: string;
    number: number;
    title: string;
    thumbnail: string;
    duration: number;
    season: {
      id: string;
      number: number;
      anime: {
        id: string;
        title: string;
        cover_image: string;
      };
    };
  };
}

export function UserWatchHistory({ userId }: UserWatchHistoryProps) {
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchWatchHistory();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]); // Add userId as a dependency

  const fetchWatchHistory = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('watch_history')
        .select(`
          id,
          watched_at,
          progress,
          completed,
          episode:episode_id (
            id,
            number,
            title,
            thumbnail,
            duration,
            season:season_id (
              id,
              number,
              anime:anime_id (
                id,
                title,
                cover_image
              )
            )
          )
        `)
        .eq('user_id', userId)
        .order('watched_at', { ascending: false });

      if (error) throw error;

      // Group by anime ID and take only the most recent episode for each anime
      const animeMap = new Map();

      // Use unknown type and then check for expected structure
      (data || []).forEach((historyItem: unknown) => {
        // Type assertion needed because Supabase doesn't provide proper types for nested queries
        const typedItem = historyItem as {
          episode?: {
            season?: {
              anime?: {
                id?: string;
              };
            };
          };
        };

        const animeId = typedItem.episode?.season?.anime?.id;

        // If this anime hasn't been added yet or this episode is more recent
        if (!animeMap.has(animeId)) {
          animeMap.set(animeId, historyItem);
        }
      });

      // Convert map values back to array
      const uniqueHistory = Array.from(animeMap.values());

      setHistory(uniqueHistory);
    } catch (error) {
      console.error('Error fetching watch history:', error);
      toast.error('Failed to load watch history');
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromHistory = async (historyItemId: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('watch_history')
        .delete()
        .eq('id', historyItemId);

      if (error) throw error;

      // Update local state
      setHistory(history.filter(item => item.id !== historyItemId));
      toast.success('Removed from watch history');
    } catch (error) {
      console.error('Error removing from watch history:', error);
      toast.error('Failed to remove from watch history');
    }
  };

  const clearAllHistory = async () => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('watch_history')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      // Update local state
      setHistory([]);
      toast.success('Watch history cleared');
    } catch (error) {
      console.error('Error clearing watch history:', error);
      toast.error('Failed to clear watch history');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="h-24 rounded-md bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <EmptyState
        title="Your watch history is empty"
        description="Start watching anime to see your history here."
        action={
          <Button asChild>
            <a href="/browse">Browse Anime</a>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Recently Watched</h2>
        <Button variant="outline" size="sm" onClick={clearAllHistory}>
          Clear All
        </Button>
      </div>

      <div className="space-y-4">
        {history.map((item) => {
          const animeSlug = slugify(item.episode.season.anime.title);
          const progressPercent = item.episode.duration
            ? Math.min(100, Math.round((item.progress / (item.episode.duration * 60)) * 100))
            : 0;

          return (
            <div key={item.id} className="flex gap-4 p-3 rounded-lg bg-card hover:bg-card/80 transition-colors group">
              <div className="relative aspect-video w-40 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                {item.episode.thumbnail ? (
                  <Image
                    src={item.episode.thumbnail}
                    alt={`Episode ${item.episode.number}`}
                    fill
                    className="object-cover"
                  />
                ) : item.episode.season.anime.cover_image ? (
                  <Image
                    src={item.episode.season.anime.cover_image}
                    alt={item.episode.season.anime.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-muted-foreground">No Preview</span>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-medium line-clamp-1">
                  {item.episode.season.anime.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Season {item.episode.season.number}, Episode {item.episode.number}
                  {item.episode.title && ` - ${item.episode.title}`}
                </p>
                <div className="mt-2">
                  <Progress value={progressPercent} className="h-1" />
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-muted-foreground">
                    Watched {formatDistanceToNow(new Date(item.watched_at), { addSuffix: true })}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                      className="h-8 w-8"
                    >
                      <Link href={`/watch/${animeSlug}/s${item.episode.season.number}/e${item.episode.number}`}>
                        <Play className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromHistory(item.id)}
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
