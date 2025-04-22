'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';

interface AnimeActivity {
  id: string;
  title: string;
  created_at: string;
  cover_image: string;
}

interface EpisodeActivity {
  id: string;
  anime_title: string;
  episode_number: number;
  updated_at: string;
}

export function AdminActivityTracker() {
  const [recentAnime, setRecentAnime] = useState<AnimeActivity[]>([]);
  const [recentEpisodes, setRecentEpisodes] = useState<EpisodeActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        // Fetch recent anime additions
        const animeResponse = await fetch('/api/admin/recent-anime');
        const animeData = await animeResponse.json();
        
        // Fetch recent episode updates
        const episodesResponse = await fetch('/api/admin/recent-episodes');
        const episodesData = await episodesResponse.json();

        setRecentAnime(animeData);
        setRecentEpisodes(episodesData);
      } catch (error) {
        console.error('Error fetching activity:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivity();
    
    // Refresh data every 5 minutes
    const interval = setInterval(fetchActivity, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Recently Added Anime</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] pr-4">
            {isLoading ? (
              <div className="text-center text-muted-foreground">Loading...</div>
            ) : recentAnime.length === 0 ? (
              <div className="text-center text-muted-foreground">No recent additions</div>
            ) : (
              <div className="space-y-4">
                {recentAnime.map((anime) => (
                  <div key={anime.id} className="flex items-center space-x-4">
                    <img
                      src={anime.cover_image}
                      alt={anime.title}
                      className="w-12 h-16 object-cover rounded"
                    />
                    <div>
                      <p className="font-medium">{anime.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Added {formatDistanceToNow(new Date(anime.created_at))} ago
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Episode Updates</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] pr-4">
            {isLoading ? (
              <div className="text-center text-muted-foreground">Loading...</div>
            ) : recentEpisodes.length === 0 ? (
              <div className="text-center text-muted-foreground">No recent updates</div>
            ) : (
              <div className="space-y-4">
                {recentEpisodes.map((episode) => (
                  <div key={episode.id} className="flex items-center space-x-4">
                    <div className="bg-muted w-12 h-12 rounded flex items-center justify-center">
                      <span className="text-lg font-bold">EP{episode.episode_number}</span>
                    </div>
                    <div>
                      <p className="font-medium">{episode.anime_title}</p>
                      <p className="text-sm text-muted-foreground">
                        Updated {formatDistanceToNow(new Date(episode.updated_at))} ago
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}