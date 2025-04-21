import { getUser } from "@/lib/server";
import { DashboardContent } from '@/components/DashboardContent';

export default async function HomePage() {
  const user = await getUser();

  // If not logged in, show public home page with trending and latest
  if (!user) {
    return <DashboardContent isPublic={true} />;
  }

  // If logged in, show personalized dashboard
  return <DashboardContent isPublic={false} userId={user.id} />;
}
