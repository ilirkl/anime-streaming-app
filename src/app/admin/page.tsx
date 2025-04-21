import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle, RefreshCw } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Add New Anime</CardTitle>
            <CardDescription>
              Add a new anime to the database from MyAnimeList
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/admin/add-anime">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Anime
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Update Episodes</CardTitle>
            <CardDescription>
              Update episodes for an existing anime
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/admin/update-anime">
                <RefreshCw className="mr-2 h-4 w-4" />
                Update Episodes
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}