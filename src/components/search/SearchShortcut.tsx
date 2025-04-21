'use client';

import { useEffect, createContext, useContext, useState } from 'react';
import { useRouter } from 'next/navigation';

// Create a context to share the mobile search state
export const SearchContext = createContext({
  isMobileSearchActive: false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setIsMobileSearchActive: (_: boolean) => {}, // Using underscore for unused parameter
});

export function useSearch() {
  return useContext(SearchContext);
}

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [isMobileSearchActive, setIsMobileSearchActive] = useState(false);

  return (
    <SearchContext.Provider value={{ isMobileSearchActive, setIsMobileSearchActive }}>
      {children}
    </SearchContext.Provider>
  );
}

export function SearchShortcut() {
  const router = useRouter();
  const { setIsMobileSearchActive } = useSearch();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if the user pressed '/' and is not in an input field
      if (
        e.key === '/' &&
        !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)
      ) {
        e.preventDefault();

        // Check if we're on mobile
        if (window.innerWidth < 640) {
          setIsMobileSearchActive(true);
        } else {
          // On desktop, focus the search input if it exists
          const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
          if (searchInput) {
            searchInput.focus();
          } else {
            router.push('/search');
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router, setIsMobileSearchActive]);

  return null; // This component doesn't render anything
}
