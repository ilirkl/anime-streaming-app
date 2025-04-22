import { NextResponse } from 'next/server';
import { createClient } from '@/lib/server';
import { getUser } from '@/lib/server';

export async function GET() {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('episodes')
      .select(`
        id,
        number,
        updated_at,
        seasons!inner (
          animes!inner (
            title
          )
        )
      `)
      .order('updated_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    const formattedData = data?.map(episode => ({
      id: episode.id,
      episode_number: episode.number,
      updated_at: episode.updated_at,
      anime_title: episode.seasons[0]?.animes[0]?.title || 'Unknown'
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('Error fetching recent episodes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent episodes' },
      { status: 500 }
    );
  }
}




