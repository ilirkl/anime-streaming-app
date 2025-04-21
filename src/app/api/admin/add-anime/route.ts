import { NextRequest, NextResponse } from 'next/server';
import { addNewAnime } from '@/lib/populate-db';
import { getUser } from '@/lib/server';

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and is an admin
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: You must be logged in' },
        { status: 401 }
      );
    }
    
    // In a real app, you would check if the user has admin privileges
    // For now, we'll allow any authenticated user to add anime
    
    // Parse the request body
    const body = await request.json();
    
    if (!body.malId || typeof body.malId !== 'number') {
      return NextResponse.json(
        { success: false, message: 'Invalid request: malId must be a number' },
        { status: 400 }
      );
    }
    
    // Add the anime
    const result = await addNewAnime(body.malId);
    
    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        result,
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in add-anime API route:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'An unknown error occurred' 
      },
      { status: 500 }
    );
  }
}
