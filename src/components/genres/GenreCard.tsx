import { Genre } from "@/lib/constants/genres";
import Link from "next/link";

interface GenreCardProps {
  genre: Genre;
}

export function GenreCard({ genre }: GenreCardProps) {
  return (
    <Link
      href={`/genres/${genre.slug}`}
      className="group relative overflow-hidden rounded-lg bg-card transition-all hover:shadow-md"
    >
      <div className="p-6">
        <h2 className="text-xl font-semibold group-hover:text-primary transition-colors">
          {genre.name}
        </h2>
        {genre.description && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
            {genre.description}
          </p>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary opacity-0 transition-opacity group-hover:opacity-100"></div>
    </Link>
  );
}
