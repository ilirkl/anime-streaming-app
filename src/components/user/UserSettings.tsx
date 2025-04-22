'use client';

import { useState, useEffect, useCallback } from "react"; // Added useCallback
import { createClient } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ThemeSwitch } from "@/components/theme/ThemeSwitch";

interface UserSettingsProps {
  userId: string;
}

interface UserProfile {
  id: string;
  username: string;
  avatar_url: string;
  email: string;
  role?: 'user' | 'admin';
}

export function UserSettings({ userId }: UserSettingsProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(true);

  const fetchUserProfile = useCallback(async () => { // Wrap in useCallback
    setIsLoading(true);
    try {
      const supabase = createClient();

      // Get user data
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      // Get profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      const userProfile = {
        id: profileData.id,
        username: profileData.username || '',
        avatar_url: profileData.avatar_url || '',
        email: userData.user?.email || '',
      };

      setProfile(userProfile);
      setUsername(userProfile.username);
      setAvatarUrl(userProfile.avatar_url);

      // Load user preferences from localStorage
      if (typeof window !== 'undefined') {
        const savedPreferences = localStorage.getItem('userPreferences');
        if (savedPreferences) {
          const preferences = JSON.parse(savedPreferences);
          setAutoplayEnabled(preferences.autoplay ?? true);
          setDarkModeEnabled(preferences.darkMode ?? true);
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error('Failed to load user profile');
    } finally {
      setIsLoading(false);
    }
  }, [userId]); // Add userId as dependency for useCallback

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]); // Add fetchUserProfile to useEffect dependencies

  const updateProfile = async () => {
    setIsSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('profiles')
        .update({
          username,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) throw error;

      // Save preferences to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('userPreferences', JSON.stringify({
          autoplay: autoplayEnabled,
          darkMode: darkModeEnabled,
        }));
      }

      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your account profile information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-shrink-0">
              <Avatar className="h-24 w-24">
                {avatarUrl && <AvatarImage src={avatarUrl} alt={username} />}
                <AvatarFallback className="text-2xl">{username?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
            </div>

            <div className="space-y-4 flex-1">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={profile?.email || ''} disabled />
                <p className="text-xs text-muted-foreground">Your email address cannot be changed</p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Your username"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="avatar">Avatar URL</Label>
                <Input
                  id="avatar"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                />
                <p className="text-xs text-muted-foreground">Enter a URL for your profile picture</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={fetchUserProfile} disabled={isSaving}>
            Reset
          </Button>
          <Button onClick={updateProfile} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Customize your viewing experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="autoplay">Autoplay Next Episode</Label>
              <p className="text-sm text-muted-foreground">
                Automatically play the next episode when the current one ends
              </p>
            </div>
            <Switch
              id="autoplay"
              checked={autoplayEnabled}
              onCheckedChange={setAutoplayEnabled}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="darkMode">Dark Mode</Label>
              <p className="text-sm text-muted-foreground">
                Use dark theme for the application
              </p>
            </div>
            <ThemeSwitch
              onThemeChange={(isDark) => setDarkModeEnabled(isDark)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={updateProfile} disabled={isSaving} className="ml-auto">
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Preferences
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
          <CardDescription>Manage your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" className="w-full" onClick={handleLogout}>
            Sign Out
          </Button>
          <Button variant="destructive" className="w-full">
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
