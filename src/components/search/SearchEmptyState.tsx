import { Search } from 'lucide-react';

export function SearchEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 rounded-lg border border-dashed">
      <Search className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium">Search for anime</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-md">
        Enter a search term to find your favorite anime series and movies.
        You can search by title, genre, or description.
      </p>
      <div className="mt-4 flex items-center gap-2">
        <p className="text-xs text-muted-foreground">Pro tip: Press</p>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          /
        </kbd>
        <p className="text-xs text-muted-foreground">anywhere to search</p>
      </div>
    </div>
  );
}
