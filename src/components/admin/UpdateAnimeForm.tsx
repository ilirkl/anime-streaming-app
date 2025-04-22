'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface StatusMessage {
  message: string;
  type: 'success' | 'error' | '';
}

interface Episode {
  number: number;
  title: string;
  title_japanese?: string;
  aired?: string;
}

export function UpdateAnimeForm() {
  const [malId, setMalId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<StatusMessage>({ message: '', type: '' });
  const [latestEpisodes, setLatestEpisodes] = useState<Episode[]>([]);

  const fetchEpisodesFromJikan = async (malId: string) => {
    try {
      const response = await fetch('/api/admin/update-anime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ malId: parseInt(malId, 10) }),
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching from Jikan:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!malId || isNaN(parseInt(malId))) {
      setStatus({
        message: 'Please enter a valid MyAnimeList ID',
        type: 'error'
      });
      return;
    }
    
    setIsLoading(true);
    setStatus({ message: '', type: '' });
    setLatestEpisodes([]);

    try {
      const data = await fetchEpisodesFromJikan(malId);
      if (data.success) {
        setStatus({ 
          message: `${data.message} (${data.newEpisodesCount} new episodes added)`, 
          type: 'success' 
        });
        setMalId('');
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
    <Card>
      <CardHeader>
        <CardTitle>Update Anime Episodes</CardTitle>
        <CardDescription>
          Enter the MyAnimeList ID to fetch and add the latest episodes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="MyAnimeList ID (e.g., 1535)"
              value={malId}
              onChange={(e) => setMalId(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Updating Episodes...' : 'Update Latest Episodes'}
          </Button>

          {status.message && (
            <Alert variant={status.type === 'success' ? 'default' : 'destructive'}>
              <AlertDescription>{status.message}</AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

