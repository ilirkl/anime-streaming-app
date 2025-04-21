import { redirect } from 'next/navigation';
import { getUser } from '@/lib/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard | Anime Streaming App',
  description: 'Admin dashboard for managing the anime streaming app',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  // In a real app, you would check if the user has admin privileges
  // For now, we'll just check if they're authenticated
  if (!user) {
    redirect('/login?next=/admin');
  }

  return (
    <div className="container py-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <aside className="w-full md:w-64 space-y-4">
          <div className="text-xl font-bold">Admin Dashboard</div>
          
          <nav className="space-y-2">
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/admin/add-anime">Add Anime</Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/admin/update-anime">Update Episodes</Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/">Back to Site</Link>
            </Button>
          </nav>
        </aside>
        
        {/* Main content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
