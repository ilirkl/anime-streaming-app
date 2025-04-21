"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, LogOut, Settings, ListVideo, History, ArrowLeft } from "lucide-react"; // Removed User, Menu, X
import Link from "next/link";
import { useState, useEffect } from "react"; // Removed useLayoutEffect
import { suppressAuthErrors } from '@/lib/suppress-auth-errors';
// Removed unused safeWindow import
import { createClient } from "@/lib/client";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
// Removed unused ThemeSwitch import
import { useTheme } from "@/components/theme/ThemeProvider";
import { useSystemTheme } from "@/hooks/useSystemTheme";
import { useRouter } from "next/navigation";
import { useUserProfile } from "@/hooks/use-user-profile";
import { SearchSuggestions } from "@/components/search/SearchSuggestions";
import { useSearch } from "@/components/search/SearchShortcut";
import { BottomNavbar } from "./BottomNavbar";
import { ContentWrapper } from "./ContentWrapper";
import React from "react"; // Import React for ReactNode type
import { User } from "@supabase/supabase-js"; // Import User type from Supabase

export function AppLayout({ children, user }: { children: React.ReactNode, user: User | null }) { // Use User | null type
  const isAuthenticated = !!user; // Use the user prop to determine authentication status
  const [searchQuery, setSearchQuery] = useState('');
  const { isMobileSearchActive, setIsMobileSearchActive } = useSearch();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { theme } = useTheme();
  const systemTheme = useSystemTheme();
  const router = useRouter();
  const { profile } = useUserProfile();

  // Suppress auth errors in the console
  useEffect(() => {
    const restoreConsole = suppressAuthErrors();
    return () => restoreConsole();
  }, []);

  // Handle Escape key to close mobile search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileSearchActive) {
        setIsMobileSearchActive(false);
        setSearchQuery('');
        setShowSuggestions(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileSearchActive, setIsMobileSearchActive]); // Added setIsMobileSearchActive

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-full flex h-14 items-center justify-between app-padding">
          {isMobileSearchActive ? (
            /* Mobile Search Bar Active */
            <div className="flex items-center w-full space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsMobileSearchActive(false);
                  setSearchQuery('');
                  setShowSuggestions(false);
                }}
                className="flex-shrink-0"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back</span>
              </Button>

              <form
                className="relative flex-1"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (searchQuery.trim()) {
                    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                    setSearchQuery('');
                    setIsMobileSearchActive(false);
                    setShowSuggestions(false);
                  } else {
                    // If empty search, just close the mobile search
                    setIsMobileSearchActive(false);
                  }
                }}
              >
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <div className="relative w-full">
                  <Input
                    type="search"
                    placeholder="Search anime..."
                    className="pl-8 w-full pr-2"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    autoFocus
                  />
                  {showSuggestions && (
                    <SearchSuggestions
                      query={searchQuery}
                      onSelectSuggestion={(title) => {
                        setSearchQuery(title);
                        setShowSuggestions(false);
                      }}
                    />
                  )}
                </div>
              </form>
            </div>
          ) : (
            /* Normal Header */
            <>
              <div className="flex items-center">
                {/* Mobile menu button removed - using bottom navbar instead */}

                <Link href="/" className="mr-6 flex items-center space-x-2">
                  {/* <YourLogo /> */}
                  <span className="font-bold text-primary">
                    AnimeApp
                  </span>
                </Link>

                {/* Desktop navigation - hidden on mobile */}
                <nav className="hidden md:flex items-center space-x-4">
                  <Link href="/browse" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Browse</Link>
                  <Link href="/genres" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Genres</Link>
                  <Link href="/browse/trending" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Trending</Link>
                  <Link href="/browse/latest" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Latest</Link>
                </nav>
              </div>

              <div className="flex items-center space-x-2 sm:space-x-4">
                {/* Theme Toggle */}
                <ThemeToggle />
                {/* Search Input - Responsive sizing */}
                <form
                  className="relative hidden sm:block w-full max-w-[160px] md:max-w-sm"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (searchQuery.trim()) {
                      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                      setSearchQuery('');
                      setShowSuggestions(false);
                    } else {
                      // Just hide suggestions if empty search
                      setShowSuggestions(false);
                    }
                  }}
                >
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <div className="relative w-full">
                      <Input
                        type="search"
                        placeholder="Search anime..."
                        className="pl-8 w-full sm:w-[160px] md:w-[200px] lg:w-[300px] pr-8"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => {
                          // Delay hiding suggestions to allow for clicks
                          setTimeout(() => setShowSuggestions(false), 200);
                        }}
                      />
                      <kbd className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                        /
                      </kbd>
                      {showSuggestions && (
                        <SearchSuggestions
                          query={searchQuery}
                          onSelectSuggestion={(title) => {
                            setSearchQuery(title);
                            setShowSuggestions(false);
                          }}
                        />
                      )}
                    </div>
                </form>

                {/* Mobile search button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="sm:hidden"
                  onClick={() => setIsMobileSearchActive(true)}
                >
                  <Search className="h-5 w-5" />
                  <span className="sr-only">Search</span>
                </Button>

                {/* User Auth Section */}
                {isAuthenticated ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                          {profile?.avatar_url && (
                            <AvatarImage src={profile.avatar_url} alt={profile?.username || 'User'} />
                          )}
                          <AvatarFallback>
                            {profile?.username ? profile.username.charAt(0).toUpperCase() : 'U'}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {profile?.username || 'User'}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {profile?.email || 'No email available'}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/user?tab=watchlist">
                          <ListVideo className="mr-2 h-4 w-4" />
                          <span>My Watchlist</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/user?tab=history">
                          <History className="mr-2 h-4 w-4" />
                          <span>Watch History</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/user?tab=settings">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Settings</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={async () => {
                        const supabase = createClient();
                        await supabase.auth.signOut();
                        window.location.href = '/';
                      }}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button asChild>
                    <Link href="/auth/login">Login</Link>
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </header>

      {/* Bottom Navigation Bar for Mobile */}
      <BottomNavbar />

      {/* Main Content Area */}
      <main className="container max-w-full py-4 sm:py-6 pb-20 md:pb-6">
        <ContentWrapper>
          {children}
        </ContentWrapper>
      </main>

      {/* Footer - hidden on mobile */}
      <footer className="border-t mt-8 hidden md:block">
          <div className="container max-w-full flex flex-col items-center justify-between gap-4 py-6 md:h-24 md:flex-row md:py-0 app-padding">
            <div className="text-center md:text-left">
              <p className="text-sm leading-loose text-muted-foreground">
                © {new Date().getFullYear()} AnimeApp. All rights reserved.
              </p>
              <p className="text-xs text-muted-foreground/70">
                Theme: {theme === 'system' ? `System (${systemTheme})` : theme}
              </p>
            </div>
            <div className="flex space-x-4">
              <Link href="/about" className="text-sm text-muted-foreground hover:text-primary">About</Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary">Terms</Link>
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">Privacy</Link>
            </div>
          </div>
      </footer>
    </div>
  );
}
