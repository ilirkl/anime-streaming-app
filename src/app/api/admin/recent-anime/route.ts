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
      .from('animes')
      .select('id, title, created_at, cover_image')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching recent anime:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent anime' },
      { status: 500 }
    );
  }
}