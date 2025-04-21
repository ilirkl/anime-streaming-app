'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export function AddAnimeForm() {
  const [malId, setMalId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    animeId?: string | null;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!malId || isNaN(parseInt(malId))) {
      setResult({
        success: false,
        message: 'Please enter a valid MyAnimeList ID'
      });
      return;
    }
    
    setIsLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/admin/add-anime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ malId: parseInt(malId) }),
      });
      
      const data = await response.json();
      
      setResult({
        success: data.success,
        message: data.message,
        animeId: data.animeId
      });
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error 
          ? `Error: ${error.message}` 
          : 'An unknown error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Add Anime from MyAnimeList</CardTitle>
        <CardDescription>
          Enter a MyAnimeList ID to fetch and add the anime to the database.
          You can find the ID in the URL of the anime page on MyAnimeList.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="malId" className="text-sm font-medium">
              MyAnimeList ID
            </label>
            <Input
              id="malId"
              type="number"
              placeholder="e.g. 1535"
              value={malId}
              onChange={(e) => setMalId(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Example: For https://myanimelist.net/anime/1535/Death_Note, the ID is 1535
            </p>
          </div>
          
          {result && (
            <Alert variant={result.success ? "default" : "destructive"}>
              {result.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertTitle>
                {result.success ? 'Success' : 'Error'}
              </AlertTitle>
              <AlertDescription>
                {result.message}
                {result.success && result.animeId && (
                  <p className="mt-2">
                    Anime ID: <code className="bg-muted px-1 py-0.5 rounded">{result.animeId}</code>
                  </p>
                )}
              </AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={handleSubmit} 
          disabled={isLoading || !malId} 
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding Anime...
            </>
          ) : (
            'Add Anime'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
