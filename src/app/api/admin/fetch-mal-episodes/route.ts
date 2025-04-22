import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/server';
import * as cheerio from 'cheerio';

async function fetchMALEpisodes(malId: string) {
  const url = `https://myanimelist.net/anime/${malId}/any/episode`;
  const response = await fetch(url);
  const html = await response.text();
  const $ = cheerio.load(html);

  const episodes: {
    number: number;
    title: string;
    title_japanese?: string;
    aired?: string;
  }[] = [];

  // Parse the episode table
  $('.episode-list tbody tr').each((_, element) => {
    const $row = $(element);
    const number = parseInt($row.find('.episode-number').text().trim(), 10);
    const title = $row.find('.episode-title a').text().trim();
    const title_japanese = $row.find('.episode-title span').text().trim();
    const aired = $row.find('.episode-aired').text().trim();

    if (number && title) {
      episodes.push({
        number,
        title,
        ...(title_japanese && { title_japanese }),
        ...(aired && { aired })
      });
    }
  });

  return episodes;
}

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: You must be logged in' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const malId = searchParams.get('malId');

    if (!malId) {
      return NextResponse.json(
        { success: false, message: 'Missing MAL ID' },
        { status: 400 }
      );
    }

    const episodes = await fetchMALEpisodes(malId);

    return NextResponse.json({
      success: true,
      episodes
    });
  } catch (error) {
    console.error('Error fetching MAL episodes:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to fetch episodes'
      },
      { status: 500 }
    );
  }
}