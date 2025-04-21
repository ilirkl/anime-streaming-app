'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Star, Clock, Calendar } from 'lucide-react'; // Removed Play
import { slugify } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface FeaturedAnime {
  id: string;
  title: string;
  coverImage: string;
  bannerImage?: string;
  synopsis?: string;
  rating?: string;
  runtime?: string;
  releaseYear?: string;
  status?: string;
}

interface FeaturedAnimeSliderProps {
  animeList: FeaturedAnime[];
}

export function FeaturedAnimeSlider({ animeList }: FeaturedAnimeSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Function to go to the next slide - wrapped in useCallback to avoid dependency issues
  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % animeList.length);
  }, [animeList.length]);

  // Function to go to the previous slide
  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + animeList.length) % animeList.length);
  };

  // Function to go to a specific slide
  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    // Reset autoplay timer when manually changing slides
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      if (isAutoPlaying) {
        autoPlayRef.current = setInterval(nextSlide, 5000);
      }
    }
  };

  // Set up autoplay
  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayRef.current = setInterval(nextSlide, 5000);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, nextSlide]); // Added nextSlide to dependency array

  // Pause autoplay when user interacts with the slider
  const pauseAutoPlay = () => {
    setIsAutoPlaying(false);
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
  };

  // Resume autoplay after user interaction
  const resumeAutoPlay = () => {
    setIsAutoPlaying(true);
  };

  // If no anime, don't render
  if (!animeList || animeList.length === 0) {
    return null;
  }

  const currentAnime = animeList[currentIndex];
  const animeSlug = slugify(currentAnime.title);

  return (
    <div
      className="relative overflow-hidden mb-8"
      onMouseEnter={pauseAutoPlay}
      onMouseLeave={resumeAutoPlay}
    >
      {/* Main Slider */}
      <div className="relative aspect-[16/9] md:aspect-[21/9] w-full">
        {/* Background Image - Full width */}
        {currentAnime.bannerImage ? (
          <Image
            src={currentAnime.bannerImage}
            alt={currentAnime.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-accent/30" />
        )}

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />

        {/* Content */}
        <div className="absolute inset-0 flex items-center">
          <div className="container flex flex-col items-start justify-center h-full z-10 py-8">
            {/* Left side: Text Content */}
            <div className="space-y-4 max-w-xl px-4 md:px-6">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs font-medium bg-primary/80 text-white hover:bg-primary/70">#5 Spotlight</Badge>
                {currentAnime.rating && (
                  <div className="flex items-center gap-1 bg-yellow-500/90 text-black px-2 py-0.5 rounded text-xs font-semibold">
                    <Star className="h-3 w-3 fill-current" />
                    <span>{currentAnime.rating}</span>
                  </div>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">{currentAnime.title}</h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">

                {currentAnime.runtime && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{currentAnime.runtime}</span>
                  </div>
                )}

                {currentAnime.releaseYear && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{currentAnime.releaseYear}</span>
                  </div>
                )}

                {currentAnime.status && (
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs font-normal border-white/30 text-white/80">
                      {currentAnime.status}
                    </Badge>
                  </div>
                )}
              </div>

              {currentAnime.synopsis && (
                <p className="text-sm md:text-base text-white/70 line-clamp-3 md:line-clamp-4 max-w-2xl">
                  {currentAnime.synopsis}
                </p>
              )}

              <div className="flex flex-wrap gap-3 pt-2">
                <Button className="bg-primary hover:bg-primary/90 rounded-full px-6" size="lg" asChild>
                  <Link href={`/anime/${animeSlug}`}>
                    Watch Now
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-white border-white/30 hover:bg-white/10 rounded-full px-6" asChild>
                  <Link href="#">Detail</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Arrows - more subtle */}
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 transition-colors"
          onClick={prevSlide}
        >
          <ChevronLeft className="h-4 w-4 text-white" />
        </button>

        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 transition-colors"
          onClick={nextSlide}
        >
          <ChevronRight className="h-4 w-4 text-white" />
        </button>
      </div>

      {/* Dots Navigation */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3 z-20">
        {animeList.map((_, index) => (
          <button
            key={index}
            className={`h-1.5 rounded-full transition-all ${
              index === currentIndex ? 'bg-white w-8' : 'bg-white/40 w-4'
            }`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
