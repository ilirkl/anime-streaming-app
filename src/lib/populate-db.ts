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
  title_english: string | null; // Add English title
  title_japanese: string | null;
  aired: string | null;
  filler: boolean;
  recap: boolean;
  synopsis: string | null;
}

// Function to convert various YouTube URLs to embed URLs
function convertToEmbedUrl(url: string | null): string | null {
  if (!url) return null;

  // Check if the URL is already an embed URL
  if (url.includes('youtube.com/embed/')) {
    return url;
  }

  // Extract video ID from various YouTube URL formats
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);

  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }

  return null; // Not a valid YouTube URL
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
    let allEpisodes: JikanEpisode[] = [];
    let page = 1;
    let hasMorePages = true;

    while (hasMorePages) {
      // Respect Jikan's rate limiting
      await new Promise(resolve => setTimeout(resolve, 4000));

      // Using the episodes endpoint specifically
      const response = await fetch(`https://api.jikan.moe/v4/anime/${malId}/episodes?page=${page}`);
      
      console.log(`Fetching episodes for MAL ID: ${malId} - Page ${page}`);
      console.log(`Response status: ${response.status}`);
      
      if (!response.ok) {
        const responseText = await response.text();
        console.error(`Error response body:`, responseText);
        
        if (response.status === 404) {
          throw new Error(`Anime with ID ${malId} not found on MyAnimeList`);
        }
        if (response.status === 429) {
          console.log('Rate limit hit, waiting 5 seconds before retry...');
          await new Promise(resolve => setTimeout(resolve, 5000));
          continue;
        }
        throw new Error(`MyAnimeList API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.data || !Array.isArray(data.data)) {
        console.error('Unexpected API response structure:', data);
        throw new Error('Invalid API response format');
      }

      // Log each episode we find
      data.data.forEach((episode: JikanEpisode, index: number) => {
        console.log(`Found Episode ${episode.mal_id}: ${episode.title}`);
        if (episode.title_japanese) {
          console.log(`Japanese title: ${episode.title_japanese}`);
        }
      });

      allEpisodes = [...allEpisodes, ...data.data];
      
      // Check pagination info
      hasMorePages = data.pagination?.has_next_page === true;
      page++;

      // Add delay between pages if there are more
      if (hasMorePages) {
        await new Promise(resolve => setTimeout(resolve, 4000));
      }
    }

    console.log(`Total episodes found: ${allEpisodes.length}`);
    allEpisodes.forEach((ep, index) => {
      console.log(`Episode ${index + 1}:`);
      console.log(`- Title: ${ep.title}`);
      console.log(`- Japanese Title: ${ep.title_japanese || 'N/A'}`);
      console.log(`- Air Date: ${ep.aired || 'N/A'}`);
      console.log('---');
    });

    return allEpisodes;
  } catch (error) {
    console.error('Error in fetchAnimeEpisodes:', error);
    throw error;
  }
}

async function fetchLatestEpisodes(malId: number): Promise<JikanEpisode[]> {
  try {
    // Start from the last page to get latest episodes
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

    const data = await response.json();
    
    // Validate the response structure
    if (!data?.pagination?.items?.total) {
      console.log('No episodes found or invalid response structure:', data);
      return [];
    }

    const totalEpisodes = data.pagination.items.total;
    const perPage = data.pagination.items.per_page || 100; // Default to 100 if not specified
    const lastPage = Math.ceil(totalEpisodes / perPage);
    
    // If there are no episodes, return empty array
    if (totalEpisodes === 0) {
      return [];
    }
    
    // Respect Jikan's rate limiting
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    // Fetch the last page
    const lastPageResponse = await fetch(`https://api.jikan.moe/v4/anime/${malId}/episodes?page=${lastPage}`);
    
    if (!lastPageResponse.ok) {
      throw new Error(`Failed to fetch last page: ${lastPageResponse.status}`);
    }
    
    const lastPageData = await lastPageResponse.json();
    
    if (!Array.isArray(lastPageData?.data)) {
      console.log('Invalid last page data structure:', lastPageData);
      return [];
    }
    
    return lastPageData.data;
  } catch (error) {
    console.error('Error in fetchLatestEpisodes:', error);
    throw error;
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

    // Convert trailer URL to embed URL
    const embedTrailerUrl = convertToEmbedUrl(anime.trailer?.url);

    // Insert anime
    const { data: animeData, error: animeError } = await supabase
      .from('animes')
      .insert({
        title: displayTitle, // Use the English title if available
        original_title: anime.title_japanese,
        synopsis: anime.synopsis,
        cover_image: anime.images.jpg.large_image_url,
        trailer_url: embedTrailerUrl, // Store the embed URL
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
        // Use title_romanji as primary, fallback to title or episode number
        const episodeTitle = episode.title_romanji || episode.title || `Episode ${index + 1}`;
        return {
          season_id: seasonData.id,
          title: episodeTitle,
          number: index + 1,
          synopsis: episode.synopsis || `Episode ${index + 1} of ${displayTitle}`,
          duration: runtime,
          air_date: episode.aired ? new Date(episode.aired) : new Date(anime.aired.from)
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

export async function updateAnimeEpisodes(malId: number) {
  try {
    console.log('Fetching latest episodes...');
    const jikanAnime = await fetchAnimeById(malId);
    const latestEpisodes = await fetchLatestEpisodes(malId);

    if (latestEpisodes.length === 0) {
      return {
        success: true,
        message: 'No episodes available for this anime',
        newEpisodesCount: 0
      };
    }

    console.log(`Found ${latestEpisodes.length} episodes on the last page`);
    
    const { data: anime, error: animeError } = await supabase
      .from('animes')
      .select('id')
      .eq('mal_id', malId)
      .single();

    if (animeError || !anime) {
      throw new Error(`Anime with MAL ID ${malId} not found`);
    }

    const animeId = anime.id;
    const displayTitle = jikanAnime.title_english || jikanAnime.title;

    // Update anime details
    await supabase
      .from('animes')
      .update({
        title: displayTitle,
        synopsis: jikanAnime.synopsis,
        status: mapJikanStatusToAnimeStatus(jikanAnime.status),
        end_date: jikanAnime.aired.to,
        updated_at: new Date().toISOString(),
        rating: jikanAnime.score,
      })
      .eq('id', animeId);

    // Get existing season
    let { data: existingSeasons } = await supabase
      .from('seasons')
      .select('*')
      .eq('anime_id', animeId)
      .order('number');

    if (!existingSeasons?.length) {
      const { data: newSeason } = await supabase
        .from('seasons')
        .insert({
          anime_id: animeId,
          title: 'Season 1',
          number: 1
        })
        .select()
        .single();

      existingSeasons = [newSeason];
    }

    // Get the latest episode number from the database
    const { data: latestDbEpisode } = await supabase
      .from('episodes')
      .select('number')
      .eq('season_id', existingSeasons[0].id)
      .order('number', { ascending: false })
      .limit(1);

    const lastEpisodeInDb = latestDbEpisode?.[0]?.number || 0;
    const newEpisodes = [];

    // Parse the runtime
    const runtime = parseAnimeRuntime(jikanAnime.duration);

    // Only process episodes that are newer than what we have in the database
    for (const episode of latestEpisodes) {
      if (episode.mal_id > lastEpisodeInDb) {
        // Use title_romanji as primary, fallback to other titles or episode number
        const episodeTitle = episode.title_romanji || 
                           episode.title_english || 
                           episode.title_japanese || 
                           `Episode ${episode.mal_id}`;
        
        console.log(`Adding new episode: ${episodeTitle}`);
        
        newEpisodes.push({
          season_id: existingSeasons[0].id,
          title: episodeTitle,
          number: episode.mal_id,
          synopsis: episode.synopsis || `Episode ${episode.mal_id} of ${displayTitle}`,
          duration: runtime,
          air_date: episode.aired ? new Date(episode.aired) : new Date(jikanAnime.aired.from)
        });
      }
    }

    console.log(`Found ${newEpisodes.length} new episodes to add`);

    if (newEpisodes.length > 0) {
      const { error: insertError } = await supabase
        .from('episodes')
        .insert(newEpisodes);

      if (insertError) {
        throw new Error(`Error inserting new episodes: ${insertError.message}`);
      }

      console.log(`Successfully added ${newEpisodes.length} new episodes:`);
      newEpisodes.forEach(ep => console.log(`- ${ep.title}`));
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












