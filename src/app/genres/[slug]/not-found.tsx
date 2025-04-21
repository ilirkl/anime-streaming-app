import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GenreNotFound() {
  return (
    <div className="container py-12 flex flex-col items-center justify-center text-center space-y-6">
      <h1 className="text-4xl font-bold">Genre Not Found</h1>
      <p className="text-muted-foreground max-w-md">
        The genre you&apos;re looking for doesn&apos;t exist or may have been removed.
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/genres">Browse All Genres</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    </div>
  );
}
