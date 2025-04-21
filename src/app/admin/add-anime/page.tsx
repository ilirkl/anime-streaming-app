import { AddAnimeForm } from '@/components/admin/AddAnimeForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Add Anime | Admin Dashboard',
  description: 'Add new anime to the database',
};

export default function AddAnimePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Add New Anime</h1>
      <p className="text-muted-foreground">
        Add a new anime to the database by entering its MyAnimeList ID.
      </p>
      <AddAnimeForm />
    </div>
  );
}
