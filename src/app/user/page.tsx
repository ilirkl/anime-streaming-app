import { redirect } from 'next/navigation';
import { getUser } from "@/lib/server";
import { UserProfileTabs } from '@/components/user/UserProfileTabs';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'User Profile | Anime Streaming App',
  description: 'Manage your profile, watchlist, and watch history',
};

export default async function UserProfilePage() {
  const user = await getUser();

  // If not logged in, redirect to login page
  if (!user) {
    redirect('/login?next=/user');
  }

  return (
    <div className="container max-w-full py-6 space-y-6">
      <h1 className="text-3xl font-bold">Your Profile</h1>
      <UserProfileTabs userId={user.id} />
    </div>
  );
}
