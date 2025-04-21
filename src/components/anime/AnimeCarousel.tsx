'use client';

import { useState, useRef, useEffect } from 'react';
import { AnimeCard } from '@/components/anime/AnimeCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

// Define the expected structure for anime items based on AnimeCard props
type AnimeItem = {
  id: string;
  title: string;
  coverImage: string;
  episodeNumber?: number;
  episodeId?: string;
  synopsis?: string;
  airDate?: string;
  status?: string;
  rating?: string;
  episodeCount?: number;
};

interface AnimeCarouselProps {
  title: string;
  animeList: AnimeItem[]; // Use the defined type
  viewAllLink?: string;
  showEpisodeInfo?: boolean;
}

export function AnimeCarousel({ title, animeList, viewAllLink, showEpisodeInfo = false }: AnimeCarouselProps) {
  // Removed unused scrollPosition state
  const carouselRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // Function to scroll the carousel
  const scroll = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return;
    
    const container = carouselRef.current;
    const scrollAmount = container.clientWidth * 0.8; // Scroll 80% of the visible width
    
    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Update arrow visibility based on scroll position
  const handleScroll = () => {
    if (!carouselRef.current) return;
    
    const container = carouselRef.current;
    const newScrollPosition = container.scrollLeft;
    
    // Removed setScrollPosition call
    setShowLeftArrow(newScrollPosition > 0);
    setShowRightArrow(newScrollPosition < container.scrollWidth - container.clientWidth - 10);
  };

  // Add scroll event listener
  useEffect(() => {
    const container = carouselRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      // Check if right arrow should be shown initially
      setShowRightArrow(container.scrollWidth > container.clientWidth);
      
      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  // If no anime, don't render
  if (!animeList || animeList.length === 0) {
    return null;
  }

  return (
    <section className="relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        {viewAllLink && (
          <Link href={viewAllLink} className="text-sm text-primary">
            View all
          </Link>
        )}
      </div>
      
      <div className="relative group">
        {/* Left scroll button */}
        {showLeftArrow && (
          <Button
            variant="secondary"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 opacity-90 shadow-md"
            onClick={() => scroll('left')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        
        {/* Carousel container */}
        <div
          ref={carouselRef}
          className="flex overflow-x-auto scrollbar-hide gap-3 pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {animeList.map((anime) => (
            <div key={anime.id || anime.episodeId} className="flex-shrink-0 w-[160px] sm:w-[180px]">
              <AnimeCard
                anime={anime}
                showEpisodeInfo={showEpisodeInfo}
              />
            </div>
          ))}
        </div>
        
        {/* Right scroll button */}
        {showRightArrow && (
          <Button
            variant="secondary"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 opacity-90 shadow-md"
            onClick={() => scroll('right')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </section>
  );
}
