'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";

export default function UpdateAnimePage() {
  const [animeId, setAnimeId] = useState('');
  const [malId, setMalId] = useState('');
  const [status, setStatus] = useState<{ message: string; type: 'success' | 'error' | '' }>({ message: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async () => {
    if (!animeId || !malId) {
      setStatus({ message: 'Please fill in all fields', type: 'error' });
      return;
    }

    setIsLoading(true);
    setStatus({ message: '', type: '' });

    try {
      const response = await fetch('/api/admin/update-anime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ animeId, malId: parseInt(malId, 10) }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus({ message: data.message, type: 'success' });
      } else {
        setStatus({ message: data.message, type: 'error' });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setStatus({
        message: 'Error updating anime: ' + errorMessage,
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Update Anime Episodes</h1>
      <p className="text-muted-foreground">
        Update episodes for an existing anime by providing its database ID and MyAnimeList ID.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Update Episodes</CardTitle>
          <CardDescription>
            Enter the anime ID from your database and the corresponding MyAnimeList ID to fetch and update episodes.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Anime ID (Database)
            </label>
            <Input
              value={animeId}
              onChange={(e) => setAnimeId(e.target.value)}
              placeholder="Enter anime ID from database"
            />
            <p className="text-xs text-muted-foreground">
              This is the UUID of the anime in your database
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              MAL ID (MyAnimeList)
            </label>
            <Input
              value={malId}
              onChange={(e) => setMalId(e.target.value)}
              placeholder="Enter MyAnimeList ID"
              type="number"
            />
            <p className="text-xs text-muted-foreground">
              Example: For https://myanimelist.net/anime/1535/Death_Note, the ID is 1535
            </p>
          </div>

          {status.message && (
            <Alert variant={status.type === 'success' ? "default" : "destructive"}>
              {status.type === 'success' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertTitle>
                {status.type === 'success' ? 'Success' : 'Error'}
              </AlertTitle>
              <AlertDescription>
                {status.message}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>

        <CardFooter>
          <Button
            onClick={handleUpdate}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating Episodes...
              </>
            ) : (
              'Update Episodes'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}