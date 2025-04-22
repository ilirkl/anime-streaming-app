import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, RefreshCw } from 'lucide-react';
import { AdminActivityTracker } from '@/components/admin/AdminActivityTracker';

export default function AdminPage() {
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

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
        <AdminActivityTracker />
      </div>
    </div>
  );
}
