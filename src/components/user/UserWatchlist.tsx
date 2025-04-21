'use client';

import { useEffect, useState } from "react";
import { createClient } from "@/lib/client";
import { AnimeCard } from "@/components/anime/AnimeCard";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/EmptyState";

interface UserWatchlistProps {
  userId: string;
}

interface WatchlistItem {
  id: string;
  animes: {
    id: string;
    title: string;
    cover_image: string | null;
  };
}

export function UserWatchlist({ userId }: UserWatchlistProps) {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchWatchlist();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]); // Add userId as a dependency

  const fetchWatchlist = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('watchlist')
        .select(`
          id,
          animes (
            id,
            title,
            cover_image
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;
      // Type assertion to match our interface
      const typedData = (data || []).map((item: unknown) => {
        // Define the expected structure
        const typedItem = item as {
          id: string;
          animes?: {
            id?: string;
            title?: string;
            cover_image?: string | null;
          };
        };

        return {
          id: typedItem.id,
          animes: {
            id: typedItem.animes?.id || '',
            title: typedItem.animes?.title || '',
            cover_image: typedItem.animes?.cover_image || null
          }
        };
      });

      setWatchlist(typedData);
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      toast.error('Failed to load watchlist');
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWatchlist = async (watchlistItemId: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('id', watchlistItemId);

      if (error) throw error;

      // Update local state
      setWatchlist(watchlist.filter(item => item.id !== watchlistItemId));
      toast.success('Removed from watchlist');
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      toast.error('Failed to remove from watchlist');
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="aspect-[2/3] rounded-md bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (watchlist.length === 0) {
    return (
      <EmptyState
        title="Your watchlist is empty"
        description="Add anime to your watchlist to keep track of what you want to watch."
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {watchlist.map((item) => (
          <div key={item.id} className="group relative">
            <AnimeCard
              anime={{
                id: item.animes.id,
                title: item.animes.title,
                coverImage: item.animes.cover_image || '/placeholder-cover.jpg',
              }}
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => removeFromWatchlist(item.id)}
              title="Remove from watchlist"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
