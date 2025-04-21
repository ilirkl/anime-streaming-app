'use client';

import React, { useState, useEffect } from 'react'; // Import React
import { suppressAuthErrors } from '@/lib/suppress-auth-errors';
import { Button, buttonVariants } from '@/components/ui/button'; // Import buttonVariants
import { type VariantProps } from 'class-variance-authority'; // Import VariantProps
import { BookmarkPlus, BookmarkCheck, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

// Define props using the pattern from ui/button.tsx
interface AddToWatchlistButtonProps extends React.ComponentProps<'button'>, VariantProps<typeof buttonVariants> {
  animeId: string;
  redirectPath?: string;
  showText?: boolean;
  isInWatchlist?: boolean;
  watchlistItemId?: string;
  allowRemove?: boolean;
  // Omit onClick as it's handled internally
}

export function AddToWatchlistButton({
  animeId,
  redirectPath,
  variant = 'outline', // Default variant
  size = 'icon',       // Default size
  showText = false,
  isInWatchlist = false,
  watchlistItemId,
  allowRemove = true,
  className,
  // Exclude onClick from props passed down
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onClick,
  ...props
}: AddToWatchlistButtonProps) {
  const [loading, setLoading] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(isInWatchlist);
  const [itemId, setItemId] = useState<string | undefined>(watchlistItemId);
  const router = useRouter();

  // Suppress auth errors in the console
  useEffect(() => {
    const restoreConsole = suppressAuthErrors();
    return () => restoreConsole();
  }, []);

  const handleAddToWatchlist = async () => {
    if (inWatchlist && allowRemove) {
      await handleRemoveFromWatchlist();
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        // Redirect to login if not authenticated
        const currentPath = redirectPath || window.location.pathname;
        router.push(`/login?next=${encodeURIComponent(currentPath)}`);
        return;
      }

      // Add to watchlist
      const { data, error } = await supabase
        .from('watchlist')
        .insert({
          user_id: session.user.id,
          anime_id: animeId
        })
        .select('id')
        .single();

      if (error) {
        if (error.code === '23505') { // Unique violation
          toast.info('This anime is already in your watchlist');

          // Try to fetch the existing watchlist item ID
          const { data: existingItem } = await supabase
            .from('watchlist')
            .select('id')
            .eq('user_id', session.user.id)
            .eq('anime_id', animeId)
            .single();

          if (existingItem) {
            setItemId(existingItem.id);
          }
        } else {
          throw error;
        }
      } else if (data) {
        setItemId(data.id);
        setInWatchlist(true);
        toast.success('Added to watchlist');
        // Refresh the page to update UI
        router.refresh();
      }
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      toast.error('Failed to add to watchlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWatchlist = async () => {
    if (!itemId && !watchlistItemId) {
      // If we don't have the watchlist item ID, we need to find it first
      await findWatchlistItem();
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        // Redirect to login if not authenticated
        const currentPath = redirectPath || window.location.pathname;
        router.push(`/login?next=${encodeURIComponent(currentPath)}`);
        return;
      }

      // Remove from watchlist
      const id = itemId || watchlistItemId;
      if (id) {
        const { error } = await supabase
          .from('watchlist')
          .delete()
          .eq('id', id);

        if (error) {
          throw error;
        } else {
          setInWatchlist(false);
          setItemId(undefined);
          toast.success('Removed from watchlist');
          // Refresh the page to update UI
          router.refresh();
        }
      } else {
        // If we still don't have the ID, try to delete by user_id and anime_id
        const { error } = await supabase
          .from('watchlist')
          .delete()
          .eq('user_id', session.user.id)
          .eq('anime_id', animeId);

        if (error) {
          throw error;
        } else {
          setInWatchlist(false);
          setItemId(undefined);
          toast.success('Removed from watchlist');
          // Refresh the page to update UI
          router.refresh();
        }
      }
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      toast.error('Failed to remove from watchlist');
    } finally {
      setLoading(false);
    }
  };

  const findWatchlistItem = async () => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) return;

      const { data } = await supabase
        .from('watchlist')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('anime_id', animeId)
        .single();

      if (data) {
        setItemId(data.id);
        await handleRemoveFromWatchlist();
      }
    } catch (error) {
      console.error('Error finding watchlist item:', error);
      toast.error('Failed to find watchlist item');
      setLoading(false);
    }
  };

  // Determine the appropriate variant based on watchlist status
  // Always use 'default' (primary color) when in watchlist for better visibility
  const buttonVariant = inWatchlist ? 'default' : variant;

  // Determine the appropriate title based on watchlist status and allowRemove
  const buttonTitle = inWatchlist
    ? (allowRemove ? "Remove from watchlist" : "In watchlist")
    : "Add to watchlist";

  return (
    <Button
      variant={buttonVariant}
      size={size}
      onClick={handleAddToWatchlist}
      disabled={loading || (inWatchlist && !allowRemove)}
      className={cn(
        className,
        inWatchlist && 'bg-primary text-primary-foreground hover:bg-primary/90'
      )}
      title={buttonTitle}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : inWatchlist ? (
        <>
          <BookmarkCheck className="h-5 w-5 text-primary-foreground" />
          {showText && <span className="ml-2">In Watchlist</span>}
        </>
      ) : (
        <>
          <BookmarkPlus className="h-5 w-5" />
          {showText && <span className="ml-2">Add to Watchlist</span>}
        </>
      )}
    </Button>
  );
}
