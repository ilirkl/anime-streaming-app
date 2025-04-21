import { Suspense } from "react";
import { WatchPageClient } from "@/components/WatchPageClient";
import { WatchPageSkeleton } from "@/components/WatchPageSkeleton";
import { animeServer } from "@/lib/anime-server";
import { notFound } from 'next/navigation'; // Removed redirect
import { createClient } from "@/lib/server";
import { getUser } from "@/lib/server";

interface WatchPageParams {
    animeName: string; // This will be the slug of the anime title
    seasonNum: string;
    episodeNum: string;
}

export default async function WatchPage({
    params
}: {
    params: Promise<WatchPageParams>
}) {
    // Await the params first
    const resolvedParams = await params;

    // Get the user without requiring authentication
    // This allows non-authenticated users to view content
    const user = await getUser();

    // Create the Supabase client - our updated createClient handles errors gracefully
    const supabase = await createClient();

    // Remove 's' and 'e' prefixes if present
    const seasonNum = parseInt(resolvedParams.seasonNum.replace('s', ''), 10);
    const episodeNum = parseInt(resolvedParams.episodeNum.replace('e', ''), 10);

    if (isNaN(seasonNum) || isNaN(episodeNum)) {
        return <div>Invalid season or episode number.</div>;
    }

    const data = await animeServer.getWatchData(
        resolvedParams.animeName,
        seasonNum,
        episodeNum
    );

    if (!data.animeDetails || !data.currentEpisode) {
        notFound();
    }

    // Check if the anime is in the user's watchlist (only for authenticated users)
    let isInWatchlist = false;
    let watchlistItemId: string | undefined;

    if (user && supabase) {
        try {
            const { data: watchlistData } = await supabase
                .from('watchlist')
                .select('id')
                .eq('user_id', user.id)
                .eq('anime_id', data.animeDetails.id)
                .maybeSingle();

            if (watchlistData) {
                isInWatchlist = true;
                watchlistItemId = watchlistData.id;
            }
        } catch (error) {
            console.error('Error checking watchlist:', error);
        }
    }

    // Fetch top 10 and trending anime for the footer
    const topAnime = await animeServer.getTopAnime(10);
    const { data: trendingAnime } = await animeServer.getTrendingAnime(6);

    // Extract the torrent ID (magnet link) from the selected link
    const torrentId = data.selectedLink?.url || null; // Use null if no link found

    return (
        <Suspense fallback={<WatchPageSkeleton />}>
            <WatchPageClient
                {...data}
                torrentId={torrentId} // Pass the torrentId down
                animeId={data.animeDetails.id}
                animeName={resolvedParams.animeName}
                seasonNum={resolvedParams.seasonNum}
                episodeNum={resolvedParams.episodeNum}
                isInWatchlist={isInWatchlist}
                watchlistItemId={watchlistItemId}
                topAnime={topAnime}
                trendingAnime={trendingAnime}
            />
        </Suspense>
    );
}
