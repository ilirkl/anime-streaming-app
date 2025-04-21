'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { slugify } from '@/lib/utils';
import { createClient } from '@/lib/client';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useSearch } from '@/components/search/SearchShortcut'; // Import useSearch

// Define type for suggestion items
type SuggestionItem = {
  id: string;
  title: string;
  cover_image: string | null;
};

interface SearchSuggestionsProps {
  query: string;
  onSelectSuggestion: (title: string) => void;
}

export function SearchSuggestions({ query, onSelectSuggestion }: SearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]); // Use defined type
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const suggestionsRef = useRef<HTMLDivElement>(null); // Explicitly type the ref
  const { setIsMobileSearchActive } = useSearch(); // Get the function via hook

  useClickOutside(suggestionsRef as React.RefObject<HTMLElement>, () => { // Assert type here
    // Add a small delay to allow for click events to register
    setTimeout(() => onSelectSuggestion(''), 100);
  });

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!query || query.length < 2) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('animes')
          .select('id, title, cover_image')
          .or(`title.ilike.%${query}%, synopsis.ilike.%${query}%`)
          .order('title')
          .limit(5);

        if (error) throw error;
        setSuggestions(data || []);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    // Debounce the search to avoid too many requests
    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  if (!query || query.length < 2) return null;

  return (
    <div ref={suggestionsRef} className="absolute top-full left-0 right-0 mt-1 bg-card border rounded-md shadow-lg z-50 max-h-[300px] overflow-y-auto">
      {loading ? (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : suggestions.length > 0 ? (
        <div className="py-1">
          {suggestions.map((anime) => (
            <button
              key={anime.id}
              className="w-full text-left px-3 py-2 hover:bg-muted/50 flex items-center gap-3"
              onClick={() => {
                // Create a slug from the anime title
                const animeSlug = slugify(anime.title);
                router.push(`/anime/${animeSlug}`);
                onSelectSuggestion('');
                // Close the mobile search if active
                setIsMobileSearchActive(false); // Use the function from the hook
              }}
            >
              <div className="relative h-10 w-7 flex-shrink-0 overflow-hidden rounded">
                {anime.cover_image && (
                  <Image
                    src={anime.cover_image}
                    alt={anime.title}
                    fill
                    className="object-cover"
                    sizes="28px"
                  />
                )}
              </div>
              <span className="line-clamp-1">{anime.title}</span>
            </button>
          ))}
          <div className="border-t mt-1 pt-1">
            <button
              className="w-full text-left px-3 py-2 text-primary text-sm hover:bg-muted/50"
              onClick={() => {
                router.push(`/search?q=${encodeURIComponent(query)}`);
                onSelectSuggestion('');
                // Close the mobile search if active
                setIsMobileSearchActive(false); // Use the function from the hook
              }}
            >
              View all results for &quot;{query}&quot;
            </button>
          </div>
        </div>
      ) : (
        <div className="p-3 text-sm text-muted-foreground">
          No results found for &quot;{query}&quot;
        </div>
      )}
    </div>
  );
}
