'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserWatchlist } from "@/components/user/UserWatchlist";
import { UserWatchHistory } from "@/components/user/UserWatchHistory";
import { UserSettings } from "@/components/user/UserSettings";
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from "react";

interface UserProfileTabsProps {
  userId: string;
}

export function UserProfileTabs({ userId }: UserProfileTabsProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('watchlist');

  // Get the tab from URL query parameters
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['watchlist', 'history', 'settings'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    router.push(`/user?tab=${value}`, { scroll: false });
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
      <TabsList className="grid w-full grid-cols-3 md:w-auto">
        <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
        <TabsTrigger value="history">Watch History</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      
      <TabsContent value="watchlist" className="space-y-4">
        <UserWatchlist userId={userId} />
      </TabsContent>
      
      <TabsContent value="history" className="space-y-4">
        <UserWatchHistory userId={userId} />
      </TabsContent>
      
      <TabsContent value="settings" className="space-y-4">
        <UserSettings userId={userId} />
      </TabsContent>
    </Tabs>
  );
}
