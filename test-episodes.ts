import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local file
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing environment variables');
  console.error('Please ensure you have set the following in your .env.local file:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface JikanAnime {
  mal_id: number;
  title: string; // Primary title
  title_english: string | null; // English title
  title_japanese: string;
  synopsis: string;
  images: {
    jpg: {
      large_image_url: string;
    };
  };
  trailer: {
    url: string;
  };
  rating: string;
  status: string;
  aired: {
    from: string;
    to: string;
  };
  episodes: number | null; // episodes can be null
  duration: string; // Format: "24 min per ep"
  score: number;
}

interface JikanEpisode {
  mal_id: number;
  title: string;
  title_japanese: string | null;
  aired: string | null;
  filler: boolean;
  recap: boolean;
  synopsis: string | null;
}

async function fetchAnimeById(malId: number): Promise<JikanAnime> {
  try {
    // Respect Jikan's rate limiting - wait longer to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 4000));

    console.log(`Fetching anime data for MAL ID: ${malId}`);
    const response = await fetch(`https://api.jikan.moe/v4/anime/${malId}/full`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Anime with ID ${malId} not found on MyAnimeList`);
      }
      if (response.status === 429) {
        throw new Error(`Rate limit exceeded. Please try again later.`);
      }
      throw new Error(`MyAnimeList API error: ${response.status}`);
    }

    // Check content type to ensure we're getting JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error(`Expected JSON response but got ${contentType}`);
    }

    const text = await response.text();
    let data;

    try {
      data = JSON.parse(text);
    } catch (error) {
      const parseError = error as Error;
      console.error('Failed to parse JSON response:', text.substring(0, 200) + '...');
      throw new Error(`Invalid JSON response from API: ${parseError.message}`);
    }

    if (!data || !data.data) {
      throw new Error('Invalid response from MyAnimeList API: missing data property');
    }

    return data.data;
  } catch (error) {
    console.error('Error in fetchAnimeById:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch anime data from MyAnimeList');
  }
}

async function fetchAnimeEpisodes(malId: number): Promise<JikanEpisode[]> {
  try {
    // Respect Jikan's rate limiting - wait longer to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 4000));

    console.log(`Fetching episodes data for MAL ID: ${malId}`);
    const response = await fetch(`https://api.jikan.moe/v4/anime/${malId}/episodes`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Anime with ID ${malId} not found on MyAnimeList`);
      }
      if (response.status === 429) {
        throw new Error(`Rate limit exceeded. Please try again later.`);
      }
      throw new Error(`MyAnimeList API error: ${response.status}`);
    }

    // Check content type to ensure we're getting JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error(`Expected JSON response but got ${contentType}`);
    }

    const text = await response.text();
    let data;

    try {
      data = JSON.parse(text);
    } catch (error) {
      const parseError = error as Error;
      console.error('Failed to parse JSON response:', text.substring(0, 200) + '...');
      throw new Error(`Invalid JSON response from API: ${parseError.message}`);
    }

    if (!data || !data.data) {
      throw new Error('Invalid response from MyAnimeList API: missing data property');
    }

    return data.data;
  } catch (error) {
    console.error('Error in fetchAnimeEpisodes:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch anime episodes data from MyAnimeList');
  }
}

function mapJikanRatingToAgeRating(rating: string): 'G' | 'PG' | 'PG-13' | 'R' | 'R+' | 'Rx' {
  const ratingMap: { [key: string]: 'G' | 'PG' | 'PG-13' | 'R' | 'R+' | 'Rx' } = {
    'G - All Ages': 'G',
    'PG - Children': 'PG',
    'PG-13 - Teens 13 or older': 'PG-13',
    'R - 17+ (violence & profanity)': 'R',
    'R+ - Mild Nudity': 'R+',
    'Rx - Hentai': 'Rx'
  };

  return ratingMap[rating] || 'PG-13';
}

function mapJikanStatusToAnimeStatus(status: string): 'ONGOING' | 'COMPLETED' | 'UPCOMING' {
  const statusMap: { [key: string]: 'ONGOING' | 'COMPLETED' | 'UPCOMING' } = {
    'Currently Airing': 'ONGOING',
    'Finished Airing': 'COMPLETED',
    'Not yet aired': 'UPCOMING'
  };

  return statusMap[status] || 'COMPLETED';
}

function parseAnimeRuntime(duration: string): number {
  // Parse duration string like "24 min per ep" to get the minutes
  const match = duration.match(/(\d+)\s*min/);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  // Default to 24 minutes if parsing fails
  return 24;
}

async function addNewAnime(malId: number) {
  try {
    console.log('Fetching anime data...');
    const anime = await fetchAnimeById(malId);

    // Check if anime already exists
    const { data: existingAnime, error: existingAnimeError } = await supabase
      .from('animes')
      .select('id')
      .eq('mal_id', malId);

    if (existingAnimeError) {
      throw new Error(`Error checking existing anime: ${existingAnimeError.message}`);
    }

    if (existingAnime && existingAnime.length > 0) {
      console.log(`Anime with MAL ID ${malId} already exists.`);
      return {
        success: false,
        message: `Anime with MAL ID ${malId} already exists.`,
        animeId: existingAnime[0].id,
        episodeCount: 0,
      };
    }

    const episodesData = await fetchAnimeEpisodes(malId);

    // Determine the title to use (English if available, otherwise primary)
    const displayTitle = anime.title_english || anime.title;

    // Insert anime
    const { data: animeData, error: animeError } = await supabase
      .from('animes')
      .insert({
        title: displayTitle, // Use the English title if available
        original_title: anime.title_japanese,
        synopsis: anime.synopsis,
        cover_image: anime.images.jpg.large_image_url,
        trailer_url: anime.trailer?.url,
        age_rating: mapJikanRatingToAgeRating(anime.rating),
        status: mapJikanStatusToAnimeStatus(anime.status),
        release_date: anime.aired.from,
        end_date: anime.aired.to,
        rating: anime.score,
        mal_id: anime.mal_id, // Add the mal_id here
      })
      .select()
      .single();

    if (animeError) {
      throw new Error(`Error inserting anime: ${animeError.message}`);
    }

    // Create first season
    const { data: seasonData, error: seasonError } = await supabase
      .from('seasons')
      .insert({
        anime_id: animeData.id,
        title: 'Season 1',
        number: 1
      })
      .select()
      .single();

    if (seasonError) {
      throw new Error(`Error creating season: ${seasonError.message}`);
    }

    // Create episodes
    if (episodesData.length > 0) {
      // Parse the runtime from the duration string
      const runtime = parseAnimeRuntime(anime.duration);
      console.log(`Parsed runtime: ${runtime} minutes from "${anime.duration}"`);

      const episodes = episodesData.map((episode, index) => {
        const episodeTitle = episode.title_japanese || `Episode ${index + 1}`;
        return {
          season_id: seasonData.id,
          title: episodeTitle,
          number: index + 1,
          synopsis: `Episode ${index + 1} of ${displayTitle}`, // Use the English title if available
          duration: runtime,
          air_date: new Date(anime.aired.from)
        };
      });

      const { error: episodesError } = await supabase
        .from('episodes')
        .insert(episodes);

      if (episodesError) {
        throw new Error(`Error creating episodes: ${episodesError.message}`);
      }
    } else {
      console.log(`No episodes to add for ${displayTitle} (MAL ID: ${malId})`);
    }

    return {
      success: true,
      message: `Successfully added ${displayTitle} with ${episodesData.length} episodes`, // Use the English title if available
      animeId: animeData.id,
      episodeCount: episodesData.length
    };
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown error occurred');
    console.error('Error adding new anime:', err);
    return {
      success: false,
      message: err.message,
      animeId: null,
      episodeCount: 0
    };
  }
}

async function updateAnimeEpisodes(animeId: string, malId: number) {
  try {
    console.log('Fetching latest episodes...');
    const jikanAnime = await fetchAnimeById(malId);
    const episodesData = await fetchAnimeEpisodes(malId);

    // Determine the title to use (English if available, otherwise primary)
    const displayTitle = jikanAnime.title_english || jikanAnime.title;

    // Get existing seasons for this anime
    // We need to use let for existingSeasons because it might be reassigned later
    // eslint-disable-next-line prefer-const
    let { data: existingSeasons, error: seasonsError } = await supabase
      .from('seasons')
      .select('*')
      .eq('anime_id', animeId)
      .order('number');

    if (seasonsError) {
      throw new Error(`Error fetching existing seasons: ${seasonsError.message}`);
    }

    // Update anime details first
    const { error: animeError } = await supabase
      .from('animes')
      .update({
        title: displayTitle, // Use the English title if available
        synopsis: jikanAnime.synopsis,
        status: mapJikanStatusToAnimeStatus(jikanAnime.status),
        end_date: jikanAnime.aired.to,
        updated_at: new Date().toISOString(),
        rating: jikanAnime.score,
      })
      .eq('id', animeId);

    if (animeError) {
      throw new Error(`Error updating anime: ${animeError.message}`);
    }

    // If no seasons exist, create season 1
    if (!existingSeasons || existingSeasons.length === 0) {
      const { data: newSeason, error: seasonError } = await supabase
        .from('seasons')
        .insert({
          anime_id: animeId,
          title: 'Season 1',
          number: 1
        })
        .select()
        .single();

      if (seasonError) {
        throw new Error(`Error creating season: ${seasonError.message}`);
      }

      existingSeasons = [newSeason];
    }

    // Get existing episodes for the first season
    const { data: existingEpisodes, error: episodesError } = await supabase
      .from('episodes')
      .select('number')
      .eq('season_id', existingSeasons[0].id)
      .order('number');

    if (episodesError) {
      throw new Error(`Error fetching existing episodes: ${episodesError.message}`);
    }

    const existingEpisodeNumbers = new Set(existingEpisodes?.map(ep => ep.number) || []);
    const newEpisodes = [];

    // Parse the runtime from the duration string
    const runtime = parseAnimeRuntime(jikanAnime.duration);
    console.log(`Parsed runtime: ${runtime} minutes from "${jikanAnime.duration}"`);

    // Calculate new episodes to add
    for (let i = 1; i <= episodesData.length; i++) {
      if (!existingEpisodeNumbers.has(i)) {
        const episodeData = episodesData.find(ep => ep.mal_id === i);
        const episodeTitle = episodeData?.title_japanese || `Episode ${i}`;
        newEpisodes.push({
          season_id: existingSeasons[0].id,
          title: episodeTitle,
          number: i,
          synopsis: `Episode ${i} of ${displayTitle}`, // Use the English title if available
          duration: runtime,
          air_date: new Date(jikanAnime.aired.from)
        });
      }
    }

    if (newEpisodes.length > 0) {
      const { error: insertError } = await supabase
        .from('episodes')
        .insert(newEpisodes);

      if (insertError) {
        throw new Error(`Error inserting new episodes: ${insertError.message}`);
      }

      console.log(`Added ${newEpisodes.length} new episodes`);
    } else {
      console.log('No new episodes to add');
    }

    return {
      success: true,
      message: `Updated anime and added ${newEpisodes.length} new episodes`,
      newEpisodesCount: newEpisodes.length
    };
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown error occurred');
    console.error('Error updating anime episodes:', err);
    return {
      success: false,
      message: err.message,
      newEpisodesCount: 0
    };
  }
}

export { updateAnimeEpisodes, addNewAnime };
