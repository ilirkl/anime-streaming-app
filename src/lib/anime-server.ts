import { createClient } from './server';

export class AnimeServer {
  private supabase: Awaited<ReturnType<typeof createClient>> | null = null;

  private async ensureClient() {
    if (!this.supabase) {
      this.supabase = await createClient();
    }
    return this.supabase;
  }

  async getTopAnime(limit: number = 10) {
    const supabase = await this.ensureClient();
    // For now, we'll just get the most popular anime (using created_at as a proxy)
    const { data, error } = await supabase
      .from('animes')
      .select('id, title, cover_image')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  async getAnimeByGenre(genre: string, limit: number = 12, page: number = 1) {
    const supabase = await this.ensureClient();
    // Since we don't have a proper genres table yet, we'll simulate genre filtering
    // In a real app, you would have a genres table and a many-to-many relationship with animes
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('animes')
      .select('id, title, cover_image, synopsis, status', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { data, count };
  }

  async getAllGenres() {
    // In a real app, this would fetch from a genres table
    // For now, we'll use the static list from constants
    return [];
  }

  async getLatestEpisodes(limit: number = 12, page: number = 1) {
    const supabase = await this.ensureClient();
    const offset = (page - 1) * limit;

    // Get total count first
    const { count, error: countError } = await supabase
      .from('episodes')
      .select('id', { count: 'exact', head: true });

    if (countError) throw countError;

    // Get episodes with pagination
    const { data, error } = await supabase
      .from('episodes')
      .select(`
        id,
        title,
        number,
        synopsis,
        thumbnail,
        duration,
        air_date,
        season_id,
        seasons:season_id (
          id,
          number,
          title,
          anime_id,
          animes:anime_id (
            id,
            title,
            cover_image,
            banner_image,
            rating
          )
        )
      `)
      .order('air_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { data, count };
  }

  async getTrendingAnime(limit: number = 6, page: number = 1) {
    const supabase = await this.ensureClient();
    const offset = (page - 1) * limit;

    // Get total count first
    const { count, error: countError } = await supabase
      .from('animes')
      .select('id', { count: 'exact', head: true });

    if (countError) throw countError;

    // For now, we'll just get the most recently added anime
    // In a real app, you would have a more sophisticated trending algorithm
    const { data, error } = await supabase
      .from('animes')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { data, count };
  }

  async getAnimeDetails(animeId: string) {
    const supabase = await this.ensureClient();
    const { data, error } = await supabase
      .from('animes')
      .select(`
        *,
        seasons!anime_id(
          id,
          number,
          title,
          episodes(
            id,
            number,
            title,
            synopsis,
            thumbnail,
            duration,
            air_date
          )
        )
      `)
      .eq('id', animeId)
      .single();

    if (error) throw error;
    return data;
  }

  async getSeasons(animeId: string) {
    const supabase = await this.ensureClient();
    const { data, error } = await supabase
      .from('seasons')
      .select('*')
      .eq('anime_id', animeId)
      .order('number');

    if (error) throw error;
    return data || [];
  }

  async getEpisodes(seasonId: string) {
    const supabase = await this.ensureClient();
    const { data, error } = await supabase
      .from('episodes')
      .select('*')
      .eq('season_id', seasonId)
      .order('number');

    if (error) throw error;
    return data || [];
  }

  async getWatchlist(userId: string) {
    const supabase = await this.ensureClient();
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
    return data;
  }

  async getWatchHistory(userId: string, limit: number = 10) {
    const supabase = await this.ensureClient();

    // First, get all watch history entries
    const { data: allHistory, error } = await supabase
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

    if (!allHistory || allHistory.length === 0) {
      return [];
    }

    // Group by anime ID and take only the most recent episode for each anime
    const animeMap = new Map();

    // Define a type for the history item structure
    type WatchHistoryItem = {
      episode: {
        season: {
          anime: {
            id: string;
          };
        };
      };
    };

    // Use type assertion to handle the nested structure
    allHistory.forEach((historyItem: unknown) => {
      const typedItem = historyItem as WatchHistoryItem;
      const animeId = typedItem.episode?.season?.anime?.id;

      // If this anime hasn't been added yet or this episode is more recent
      if (!animeMap.has(animeId)) {
        animeMap.set(animeId, historyItem);
      }
    });

    // Convert map values back to array and limit the results
    const uniqueHistory = Array.from(animeMap.values()).slice(0, limit);

    return uniqueHistory;
  }

  async searchAnime(query: string, limit: number = 24, page: number = 1) {
    const supabase = await this.ensureClient();
    const offset = (page - 1) * limit;

    // Search in anime titles and synopsis
    const { data, error, count } = await supabase
      .from('animes')
      .select('id, title, cover_image, synopsis, status', { count: 'exact' })
      .or(`title.ilike.%${query}%, synopsis.ilike.%${query}%`)
      .order('title')
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { data: data || [], count };
  }

  async getAnimeBySlug(slug: string) {
    const supabase = await this.ensureClient();

    // Check if the slug is a UUID (direct ID lookup)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

    if (isUuid) {
      // If it's a UUID, do a direct lookup by ID
      const { data, error } = await supabase
        .from('animes')
        .select(`
          *,
          seasons!anime_id(
            id,
            number,
            title,
            episodes(
              id,
              number,
              title,
              synopsis,
              thumbnail,
              duration,
              air_date
            )
          )
        `)
        .eq('id', slug)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    }

    // If it's not a UUID, try to find by slug
    const { data, error } = await supabase
      .from('animes')
      .select(`
        *,
        seasons!anime_id(
          id,
          number,
          title,
          episodes(
            id,
            number,
            title,
            synopsis,
            thumbnail,
            duration,
            air_date
          )
        )
      `);

    if (error) throw error;

    // Since we don't store slugs in the database, we need to find the anime by comparing slugs
    // In a production app, you would add a slug column to the animes table
    const { slugify } = await import('./utils');
    const anime = data.find(a => slugify(a.title) === slug);

    return anime || null;
  }

  async getWatchData(animeIdOrSlug: string, seasonNum: number, episodeNum: number) {
    const supabase = await this.ensureClient();

    // Get anime details using the improved getAnimeBySlug method
    const animeDetails = await this.getAnimeBySlug(animeIdOrSlug);

    // If anime not found, return early
    if (!animeDetails) {
      return {
        animeDetails: null,
        seasons: [],
        currentSeason: null,
        episodes: [],
        currentEpisode: null,
        streamingLinks: [],
        selectedLink: null,
        error: 'Anime not found'
      };
    }

    // Use the anime ID for subsequent queries
    const animeId = animeDetails.id;

    // Get all seasons for this anime
    const { data: seasons } = await supabase
      .from('seasons')
      .select('*')
      .eq('anime_id', animeId)
      .order('number');

    // Get current season
    const currentSeason = seasons?.find(s => s.number === seasonNum) || null;

    // Get episodes for current season
    const { data: episodes } = currentSeason ? await supabase
      .from('episodes')
      .select('*')
      .eq('season_id', currentSeason.id)
      .order('number') : { data: [] };

    // Get current episode
    const currentEpisode = episodes?.find(e => e.number === episodeNum) || null;

    // Get streaming links for current episode
    const { data: streamingLinks } = currentEpisode ? await supabase
      .from('streaming_links')
      .select('*')
      .eq('episode_id', currentEpisode.id) : { data: [] };

    // Select the first streaming link as default
    const selectedLink = streamingLinks?.[0] || null;

    return {
      animeDetails,
      seasons: seasons || [],
      currentSeason,
      episodes: episodes || [],
      currentEpisode,
      streamingLinks: streamingLinks || [],
      selectedLink,
      error: null
    };
  }
}

export const animeServer = new AnimeServer();
