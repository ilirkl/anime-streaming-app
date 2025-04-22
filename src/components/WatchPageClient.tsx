'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from "next/image";
import Link from "next/link";

// Import UI components
// import { AspectRatio } from "@/components/ui/aspect-ratio"; // Removed AspectRatio import
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Tv, AlertCircle, Menu, X, ChevronLeft, ChevronRight, MoreHorizontal, Heart, Share2, Info, Clock, Film, Play } from "lucide-react";
import { createClient } from "@/lib/client";
import { suppressAuthErrors } from '@/lib/suppress-auth-errors';
import { toast } from "sonner";
import { AddToWatchlistButton } from "@/components/anime/AddToWatchlistButton";
import { AnimeCarousel } from "@/components/anime/AnimeCarousel";
import { AuthNotification } from "@/components/auth/AuthNotification";
// Remove static import for webtorrent
import Script from 'next/script'; // Import next/script

// Define proper types for Webtor
interface WebtorSDK {
  push: (config: WebtorConfig) => void;
}

interface WebtorConfig {
  id: string;
  magnet: string;
  width: string;
  autoplay?: boolean;
  features?: {
    embed?: boolean;
    settings?: boolean;
    [key: string]: boolean | undefined;
  };
}

declare global {
  interface Window {
    webtor: WebtorSDK;
  }
}

// Helper function to truncate text
const truncateText = (text: string, maxLength: number = 200) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

// Component for text with read more functionality
function TruncatedText({ text, maxLength = 200, className = '' }: { text: string, maxLength?: number, className?: string }) {
  const [expanded, setExpanded] = useState(false);
  const needsTruncation = text && text.length > maxLength;

  if (!text) return null;

  return (
    <div className={className}>
      <p className="text-sm text-muted-foreground">
        {expanded ? text : truncateText(text, maxLength)}
      </p>
      {needsTruncation && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-primary hover:text-primary/80 mt-1 flex items-center"
        >
          {expanded ? 'Show Less' : 'Read More'}
          <MoreHorizontal className="h-3 w-3 ml-1" />
        </button>
      )}
    </div>
  );
};

interface AnimeDetails {
    id: string;
    title: string;
    original_title: string | null;
    synopsis: string | null;
    cover_image: string | null;
    banner_image: string | null;
    age_rating: string | null;
    status: string | null;
    release_date: string | null;
    end_date: string | null;
}

interface Season {
    id: string;
    anime_id: string;
    number: number;
    title: string | null;
}

interface Episode {
    id: string;
    season_id: string;
    number: number;
    title: string;
    synopsis: string | null;
    thumbnail: string | null;
    duration: number | null;
    air_date: string | null;
}

interface StreamingLink {
    id: string;
    episode_id: string;
    quality: string;
    url: string; // This will now be a magnet link
    provider: string;
}

interface WatchPageClientProps {
    animeDetails: AnimeDetails | null;
    seasons: Season[];
    currentSeason: Season | null;
    episodes: Episode[];
    currentEpisode: Episode | null;
    streamingLinks: StreamingLink[];
    error: string | null;
    animeId: string;
    animeName?: string; // Optional slug/name for the new URL structure
    seasonNum?: string;
    episodeNum?: string;
    isInWatchlist?: boolean; // Whether the anime is in the user's watchlist
    watchlistItemId?: string; // ID of the watchlist item if it exists
    topAnime?: Array<{ id: string; title: string; cover_image?: string | null }>; // Top 10 anime for the footer
    trendingAnime?: Array<{ id: string; title: string; cover_image?: string | null }>; // Trending anime for the footer
    torrentId?: string | null; // Add torrentId prop
}

export function WatchPageClient({
    animeDetails,
    seasons = [],
    currentSeason,
    episodes,
    currentEpisode,
    streamingLinks,
    error,
    animeId,
    animeName,
    isInWatchlist: initialIsInWatchlist = false,
    watchlistItemId: initialWatchlistItemId,
    topAnime = [],
    trendingAnime = [],
}: WatchPageClientProps) {
    const router = useRouter();
    const [showEpisodeList, setShowEpisodeList] = useState(false);
    const [showAnimeInfo, setShowAnimeInfo] = useState(false);
    const [isInWatchlist, setIsInWatchlist] = useState(initialIsInWatchlist);
    const [watchlistItemId, setWatchlistItemId] = useState(initialWatchlistItemId);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const playerRef = useRef<HTMLDivElement>(null); // Ref for the player container
    const [magnetLink, setMagnetLink] = useState<string | null>(null);
    const [isEmbedSdkLoaded, setIsEmbedSdkLoaded] = useState(false); // Track script load status

    // Check if user is authenticated
    useEffect(() => {
        // Suppress auth errors in the console
        const restoreConsole = suppressAuthErrors();

        const checkAuth = async () => {
            try {
                const supabase = createClient();
                const { data } = await supabase.auth.getSession();
                // Silently handle any errors and treat as not authenticated
                if (!data || !data.session) {
                    setIsAuthenticated(false);
                    return;
                }
                setIsAuthenticated(true);
            } catch {
                // Silently handle any errors and treat as not authenticated
                setIsAuthenticated(false);
            }
        };

        checkAuth();

        // Restore console.error when component unmounts
        return () => restoreConsole();
    }, []);

    // Share functionality
    const shareContent = () => {
        if (navigator.share) {
            navigator.share({
                title: `${animeDetails?.title} - Episode ${currentEpisode?.number}`,
                text: `Watch ${animeDetails?.title} Episode ${currentEpisode?.number}${currentEpisode?.title ? `: ${currentEpisode.title}` : ''} on HiAnime`,
                url: window.location.href,
            })
            .then(() => toast.success('Shared successfully'))
            .catch((error) => {
                console.error('Error sharing:', error);
                // Fallback for when sharing fails or is cancelled
                copyToClipboard();
            });
        } else {
            // Fallback for browsers that don't support the Web Share API
            copyToClipboard();
        }
    };

    // Fallback copy to clipboard function
    const copyToClipboard = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url)
            .then(() => toast.success('Link copied to clipboard'))
            .catch(err => {
                console.error('Failed to copy:', err);
                toast.error('Failed to copy link');
            });
    };

    // Calculate next and previous episode
    const currentEpisodeIndex = episodes.findIndex(ep => ep.id === currentEpisode?.id);
    const prevEpisode = currentEpisodeIndex > 0 ? episodes[currentEpisodeIndex - 1] : null;
    const nextEpisode = currentEpisodeIndex < episodes.length - 1 ? episodes[currentEpisodeIndex + 1] : null;

    // Auto-scroll to current episode when episode list is shown
    useEffect(() => {
        if (showEpisodeList && currentEpisode) {
            // Small delay to ensure the DOM is ready
            const timer = setTimeout(() => {
                const currentEpisodeElement = document.getElementById(`episode-${currentEpisode.id}`);
                if (currentEpisodeElement) {
                    currentEpisodeElement.scrollIntoView({ behavior: 'auto', block: 'center' });
                }
            }, 100);

            return () => clearTimeout(timer);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showEpisodeList, currentEpisode?.id]);

    // Check watchlist status when authentication state changes or animeDetails changes
    useEffect(() => {
        if (isAuthenticated && animeDetails?.id) {
            checkWatchlist();
        }
    }, [isAuthenticated, animeDetails?.id]);

    const checkWatchlist = async () => {
        if (!animeDetails) {
            setIsInWatchlist(false);
            setWatchlistItemId(undefined);
            return;
        }

        try {
            const supabase = createClient();
            const { data, error: sessionError } = await supabase.auth.getSession();

            if (sessionError || !data || !data.session || !data.session.user) {
                setIsInWatchlist(false);
                setWatchlistItemId(undefined);
                return;
            }

            const { data: watchlistData, error: watchlistError } = await supabase
                .from('watchlist')
                .select('id')
                .eq('user_id', data.session.user.id)
                .eq('anime_id', animeDetails.id)
                .maybeSingle();

            if (watchlistError) {
                setIsInWatchlist(false);
                setWatchlistItemId(undefined);
                return;
            }

            if (watchlistData) {
                setIsInWatchlist(true);
                setWatchlistItemId(watchlistData.id);
            } else {
                setIsInWatchlist(false);
                setWatchlistItemId(undefined);
            }
        } catch {
            setIsInWatchlist(false);
            setWatchlistItemId(undefined);
        }
    };

    // Fetch magnet link on episode change
    useEffect(() => {
        const fetchMagnetLink = async () => {
            if (!currentEpisode || !streamingLinks) {
                setMagnetLink(null);
                return;
            }

            // Find the streaming link with the highest quality (you can adjust this logic)
            const sortedLinks = streamingLinks.sort((a, b) => {
                // Example: Sort by quality (assuming quality is like "1080p", "720p", etc.)
                const qualityOrder = ["2160p", "1080p", "720p", "480p", "360p"];
                return qualityOrder.indexOf(a.quality) - qualityOrder.indexOf(b.quality);
            });

            const bestLink = sortedLinks.find(link => link.episode_id === currentEpisode.id);

            if (bestLink) {
                setMagnetLink(bestLink.url);
            } else {
                setMagnetLink(null);
            }
        };

        fetchMagnetLink();
    }, [currentEpisode, streamingLinks]);

    // Initialize player using next/script and polling
    useEffect(() => {
        let pollIntervalId: NodeJS.Timeout | null = null;
        const pollTimeoutId: NodeJS.Timeout | null = null; // Changed to const since it's never reassigned

        const initializePlayerWithPolling = async () => {
            console.log('Starting polling for EmbedSDK...');
            let attempts = 0;
            const maxAttempts = 20;
            const pollFrequency = 500;

            pollIntervalId = setInterval(async () => {
                attempts++;
                console.log(`Polling for EmbedSDK attempt ${attempts}...`);
                let WebtorSDK: WebtorSDK | null = null;
                
                if (typeof window.webtor === 'object' || typeof window.webtor === 'function') {
                    WebtorSDK = window.webtor;
                }

                if (WebtorSDK) {
                    console.log('EmbedSDK found via polling!');
                    if (pollIntervalId) clearInterval(pollIntervalId);
                    if (pollTimeoutId) clearTimeout(pollTimeoutId);

                    if (!playerRef.current || !magnetLink) {
                        console.error("Cannot initialize player: Missing playerRef or magnetLink at time of SDK discovery.");
                        return;
                    }
                    
                    try {
                        console.log('Initializing Webtor embed...');
                        console.log('Initializing Webtor embed with magnet:', magnetLink);
                        window.webtor.push({
                            id: 'webtor-player',
                            magnet: magnetLink,
                            width: '100%',
                            autoplay: true,
                            features: {
                                embed: false,
                            },
                        });
                        console.log('Webtor player initialization command pushed.');
                    } catch (error) {
                        console.error('Error pushing command to Webtor SDK:', error);
                        if (error instanceof Error) {
                            console.error('Error name:', error.name);
                            console.error('Error message:', error.message);
                            console.error('Error stack:', error.stack);
                        }
                    }
                } else if (attempts >= maxAttempts) {
                    console.error('EmbedSDK polling timed out. Could not find constructor.');
                    if (pollIntervalId) clearInterval(pollIntervalId);
                    if (pollTimeoutId) clearTimeout(pollTimeoutId);
                }
            }, pollFrequency);
        };

        // Start initialization process if magnetLink exists and script is loaded/loading
        if (magnetLink && playerRef.current && isEmbedSdkLoaded) {
             console.log('Conditions met: magnetLink, playerRef, isEmbedSdkLoaded=true. Starting polling.');
             initializePlayerWithPolling();
        } else {
             console.log('Conditions not met for polling:', { magnetLink: !!magnetLink, playerRef: !!playerRef.current, isEmbedSdkLoaded });
             // Clear the player container if magnetLink becomes null
             if (!magnetLink && playerRef.current) {
                 playerRef.current.innerHTML = '';
             }
        }

        // Cleanup function
        return () => {
            console.log('Cleaning up WebTorrent player and SDK polling...');
            if (pollIntervalId) clearInterval(pollIntervalId);
            if (pollTimeoutId) clearTimeout(pollTimeoutId);

            const playerElement = document.getElementById('webtor-player');
            if (playerElement) {
                playerElement.innerHTML = '';
            }
        };
    }, [magnetLink, isEmbedSdkLoaded]); // Depend on magnetLink and script load status

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    if (!animeDetails || !currentSeason || !currentEpisode) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <>
            <Script
                src="https://cdn.jsdelivr.net/npm/@webtor/embed-sdk-js@0.2.19/dist/index.min.js" // Try unpkg CDN
                strategy="lazyOnload" // Load after hydration + idle
                onLoad={() => {
                    console.log('EmbedSDK script loaded via next/script.');
                    setIsEmbedSdkLoaded(true); // Set state when script loads
                }}
                onError={(e) => {
                    console.error('Failed to load EmbedSDK script via next/script:', e);
                     setIsEmbedSdkLoaded(false); // Indicate failure
                 }}
             />
             <div className="flex flex-col min-h-screen bg-background">
                 {/* Mobile Header with controls - only visible on small screens */}
                 <div className="md:hidden flex items-center justify-between p-3 border-b">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowEpisodeList(!showEpisodeList)}
                    aria-label="Toggle episode list"
                >
                    {showEpisodeList ? <X size={20} /> : <Menu size={20} />}
                </Button>

                <h1 className="text-sm font-medium truncate flex-1 text-center">
                    {animeDetails.title} - Episode {currentEpisode.number}
                </h1>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowAnimeInfo(!showAnimeInfo)}
                    aria-label="Toggle anime info"
                >
                    <Tv size={20} />
                </Button>
            </div>

            {/* Main content area flex container */}
            <div className="flex flex-1"> {/* Removed 'relative' class */}
                {/* Left side: Episode List - hidden on mobile by default */}
                {/* Note: Removing 'relative' from the parent might affect the absolute positioning used for sidebars on mobile views. */}
                <div className={`${showEpisodeList ? 'flex' : 'hidden'} md:flex w-full md:w-64 absolute md:relative z-10 h-full md:h-auto inset-0 md:inset-auto bg-background/95 dark:bg-muted/10 md:border-r flex-col`}>
                    <div className="flex flex-col h-full">
                        <div className="p-3 border-b flex items-center justify-between">
                            <h3 className="text-sm font-medium">Episodes</h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="md:hidden h-8 w-8 p-0"
                                onClick={() => setShowEpisodeList(false)}
                            >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Close</span>
                            </Button>
                        </div>
                        {seasons.length > 1 && (
                            <div className="px-3 py-2 border-b">
                                <select
                                    className="w-full text-sm bg-muted/30 border rounded-md px-2 py-1"
                                    value={currentSeason.id}
                                    onChange={(e) => {
                                        const selectedSeason = seasons.find(s => s.id === e.target.value);
                                        if (selectedSeason) {
                                            // Find the first episode of the selected season from the episodes array
                                            const seasonEpisodes = episodes.filter(ep => ep.season_id === selectedSeason.id);
                                            const firstEpisode = seasonEpisodes.length > 0 ? seasonEpisodes[0] : null;

                                            if (firstEpisode) {
                                                router.push(`/watch/${animeName || animeId}/s${selectedSeason.number}/e${firstEpisode.number}`);
                                            } else {
                                                // If no episodes found, just navigate to the season
                                                router.push(`/anime/${animeName || animeId}/season/${selectedSeason.number}`);
                                            }
                                        }
                                    }}
                                >
                                    {seasons.map((season) => (
                                        <option key={season.id} value={season.id}>
                                            Season {season.number}{season.title ? `: ${season.title}` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                        {/* Jump to current episode button removed */}
                        <ScrollArea className="flex-1 h-[calc(100vh-150px)] md:h-auto md:max-h-[calc(9/16*min(100vw-64px-80px,1280px-64px-80px))] episode-list-container overflow-y-auto">
                            <div className="p-0">
                                <div className="grid gap-0.5">
                                    {episodes.map((episode) => {
                                        // Check if this episode is the current episode
                                        const isCurrentEpisode = episode.id === currentEpisode.id;

                                        return (
                                            <Link
                                                key={episode.id}
                                                id={`episode-${episode.id}`}
                                                href={`/watch/${animeName || animeId}/s${currentSeason.number}/e${episode.number}`}
                                                className={`relative flex items-center py-2.5 px-3 transition-colors group ${isCurrentEpisode
                                                    ? 'bg-primary/20 border-l-2 border-primary font-medium'
                                                    : 'hover:bg-muted/40'}`}
                                                onClick={() => setShowEpisodeList(false)}
                                            >
                                                <div className="flex items-center w-full">
                                                    <div className="w-6 text-center mr-3">
                                                        <span className={`text-sm ${isCurrentEpisode ? 'font-bold text-primary' : 'text-muted-foreground'}`}>
                                                            {episode.number}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <span className={`text-sm ${isCurrentEpisode ? 'font-medium' : 'text-muted-foreground'} block truncate`}>
                                                            {episode.title || `Episode ${episode.number}`}
                                                        </span>
                                                    </div>
                                                    <div className="ml-2 flex-shrink-0">
                                                        {isCurrentEpisode ? (
                                                            <div className="bg-primary rounded-full p-1">
                                                                <Play className="h-3 w-3 text-primary-foreground" fill="currentColor" />
                                                            </div>
                                                        ) : (
                                                            <div className="bg-muted/40 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Play className="h-3 w-3" fill="currentColor" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                                <div className="p-3 border-t space-y-2">
                                    {episodes.length > 20 && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full text-xs h-7"
                                            onClick={() => {
                                                // Scroll to the top of the episode list
                                                const episodeListContainer = document.querySelector('.episode-list-container');
                                                if (episodeListContainer) {
                                                    episodeListContainer.scrollTop = 0;
                                                }
                                            }}
                                        >
                                            <ChevronLeft className="h-3 w-3 rotate-90 mr-1" /> Back to top
                                        </Button>
                                    )}

                                    {/* Mobile only back to video button */}
                                    <Button
                                        variant="default"
                                        size="sm"
                                        className="w-full text-xs h-7 md:hidden"
                                        onClick={() => setShowEpisodeList(false)}
                                    >
                                        <Play className="h-3 w-3 mr-1" /> Back to video
                                    </Button>
                                </div>
                            </div>
                        </ScrollArea>
                    </div>
                </div>

                {/* Center: Video Player and Controls */}
                <div className="flex-1 flex flex-col">
                    {/* Container for the player */}
                    <div className="w-full bg-black"> {/* Remove relative positioning */}
                        {/* The player container */}
                        {magnetLink ? (
                            <div
                                id="webtor-player"
                                ref={playerRef}
                                className="aspect-video w-full md:h-[800px] md:aspect-auto" // Responsive: aspect ratio on mobile, fixed height on desktop
                            />
                        ) : (
                            <div className="aspect-video w-full md:h-[800px] md:aspect-auto flex items-center justify-center text-muted-foreground bg-black"> {/* Placeholder with same responsive classes */}
                                <Tv className="h-12 w-12 mr-2" />
                                <span>No streaming link available for this episode.</span>
                            </div>
                        )}
                    </div>
                    {/* Removed the empty AspectRatio wrapper */}

                    {/* Video Controls - Removed from absolute overlay */}
                    {/* <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent"> */}
                        {/* <div className="flex flex-col gap-2"> */}
                            {/* Episode navigation moved below */}
                        {/* </div> */}
                    {/* </div> */}
                {/* </div> << Removed incorrect closing tag placement */}

                {/* Episode Navigation - Moved below the player */}
                <div className="flex justify-between items-center p-4 border-b">
                         {prevEpisode ? (
                             <Button
                                 variant="outline"
                                            size="sm"
                                            className="text-white bg-black/50 hover:bg-black/70"
                                            onClick={() => {
                                                router.push(`/watch/${animeName || animeId}/s${currentSeason.number}/e${prevEpisode.number}`);
                                            }}
                                        >
                                            <ChevronLeft className="mr-1 h-4 w-4" /> Prev
                                        </Button>
                                    ) : (
                                        <div></div> /* Placeholder to keep alignment */
                                    )}

                                    {nextEpisode ? (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-white bg-black/50 hover:bg-black/70"
                                            onClick={() => {
                                                router.push(`/watch/${animeName || animeId}/s${currentSeason.number}/e${nextEpisode.number}`);
                                            }}
                                        >
                                            Next <ChevronRight className="ml-1 h-4 w-4" />
                                        </Button>
                                 ) : (
                                     <div></div> /* Placeholder to keep alignment */
                                 )}
                     </div>


                    {/* Auth notification for non-authenticated users */}
                    {!isAuthenticated && (
                        <div className="p-4 border-b">
                            <AuthNotification
                                currentPath={`/watch/${animeName || animeId}/s${currentSeason.number}/e${currentEpisode.number}`}
                                className="mb-0"
                            />
                        </div>
                    )}

                    {/* Episode title and description - visible on medium screens and up */}
                    <div className="hidden md:block p-4 border-b">
                        <div className="flex justify-between items-start mb-2">
                            <h2 className="text-lg font-medium">Episode {currentEpisode.number}{currentEpisode.title ? `: ${currentEpisode.title}` : ''}</h2>
                            <div className="flex items-center gap-2">
                                {currentEpisode.duration && (
                                    <span className="text-xs bg-muted px-2 py-1 rounded flex items-center gap-1">
                                        <Clock className="h-3 w-3" /> {currentEpisode.duration} min
                                    </span>
                                )}
                                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={shareContent}>
                                    <Share2 className="h-3 w-3 mr-1" /> Share
                                </Button>
                            </div>
                        </div>
                        {currentEpisode.synopsis && (
                            <div className="bg-muted/30 p-3 rounded-md border">
                                <TruncatedText text={currentEpisode.synopsis} maxLength={150} />
                            </div>
                        )}
                    </div>
                </div> {/* << Added correct closing tag placement for center column */}

                {/* Right side: Anime Info - hidden on mobile by default */}
                <div className={`${showAnimeInfo ? 'flex' : 'hidden'} md:flex w-full md:w-80 absolute md:relative z-10 h-full md:h-auto inset-0 md:inset-auto bg-background md:bg-muted/30 md:border-l flex-col`}>
                    <div className="flex flex-col h-full">
                        <div className="hidden md:block p-2 border-b"></div>
                        <ScrollArea className="flex-1 h-[calc(100vh-150px)] md:h-auto md:max-h-[calc(9/16*min(100vw-64px-80px,1280px-64px-80px))] overflow-y-auto">
                            <div className="p-4 pt-3">
                            {animeDetails && (
                                <>
                                    <div className="aspect-[3/4] relative mb-4 max-w-[200px] mx-auto md:mx-0">
                                        <Image
                                            src={animeDetails.cover_image || '/placeholder-cover.jpg'}
                                            alt={animeDetails.title}
                                            fill
                                            className="object-cover rounded-lg"
                                            sizes="(max-width: 768px) 200px, 300px"
                                        />
                                    </div>
                                    <h1 className="text-xl font-bold mb-2">{animeDetails.title}</h1>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 mb-4">
                                        {isAuthenticated ? (
                                            <AddToWatchlistButton
                                                animeId={animeDetails.id}
                                                isInWatchlist={isInWatchlist}
                                                watchlistItemId={watchlistItemId}
                                                variant="outline"
                                                size="icon"
                                                showText={false}
                                                className="flex-1"
                                                redirectPath={`/watch/${animeName || animeId}/s${currentSeason.number}/e${currentEpisode.number}`}
                                            >
                                                <Heart className="h-4 w-4" />
                                            </AddToWatchlistButton>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="flex-1"
                                                onClick={() => router.push(`/login?next=${encodeURIComponent(`/watch/${animeName || animeId}/s${currentSeason.number}/e${currentEpisode.number}`)}`)}>
                                                <Heart className="h-4 w-4" />
                                            </Button>
                                        )}

                                        <Button variant="outline" size="icon" className="flex-1" onClick={shareContent}>
                                            <Share2 className="h-4 w-4" />
                                        </Button>

                                        <Link
                                            href={`/anime/${animeName || animeId}`}
                                            className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10 flex-1`}
                                        >
                                            <Info className="h-4 w-4" />
                                        </Link>
                                    </div>

                                    {/* Synopsis with reduced character count */}
                                    {animeDetails.synopsis && (
                                        <div className="mb-4">
                                            <div className="flex items-center gap-2 text-sm font-medium mb-1">
                                                <Film className="h-4 w-4" />
                                                <span>Synopsis</span>
                                            </div>
                                            <TruncatedText
                                                text={animeDetails.synopsis}
                                                maxLength={150}
                                            />
                                        </div>
                                    )}

                                    {/* Info Cards */}
                                    <div className="grid grid-cols-2 gap-2 mb-4">
                                        {animeDetails.age_rating && (
                                            <div className="flex flex-col items-center justify-center p-2 border rounded-md bg-muted/30">
                                                <span className="text-xs text-muted-foreground">Rating</span>
                                                <span className="text-sm font-medium">{animeDetails.age_rating}</span>
                                            </div>
                                        )}

                                        {animeDetails.release_date && (
                                            <div className="flex flex-col items-center justify-center p-2 border rounded-md bg-muted/30">
                                                <span className="text-xs text-muted-foreground">Released</span>
                                                <span className="text-sm font-medium">{new Date(animeDetails.release_date).getFullYear()}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Mobile only close button */}
                                    <div className="mt-6 md:hidden">
                                        <Button
                                            className="w-full"
                                            variant="outline"
                                            onClick={() => setShowAnimeInfo(false)}
                                        >
                                            Close
                                        </Button>
                                    </div>
                                </>
                            )}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </div>

            {/* Footer with Top 10 and Trending Anime */}
            {(topAnime.length > 0 || trendingAnime.length > 0) && (
                <div className="container mt-8 pb-8 space-y-8">
                    <div className="border-t pt-8">
                        {/* Top 10 Anime */}
                        {topAnime.length > 0 && (
                            <AnimeCarousel
                                title="Top 10 Anime"
                                animeList={topAnime.map(anime => ({
                                    id: anime.id,
                                    title: anime.title,
                                    coverImage: anime.cover_image || '/placeholder-cover.jpg'
                                }))}
                            />
                        )}

                        {/* Trending Anime */}
                        {trendingAnime.length > 0 && (
                            <div className="mt-8">
                                <AnimeCarousel
                                    title="Trending Now"
                                    animeList={trendingAnime.map(anime => ({
                                        id: anime.id,
                                        title: anime.title,
                                        coverImage: anime.cover_image || '/placeholder-cover.jpg'
                                    }))}
                                    viewAllLink="/browse/trending"
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    </>
    );
}
