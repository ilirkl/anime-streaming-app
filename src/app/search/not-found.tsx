import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SearchNotFound() {
  return (
    <div className="container py-12 flex flex-col items-center justify-center text-center space-y-6">
      <h1 className="text-4xl font-bold">Page Not Found</h1>
      <p className="text-muted-foreground max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/">Go Home</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/browse">Browse Anime</Link>
        </Button>
      </div>
    </div>
  );
}
