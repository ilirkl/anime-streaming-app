import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function UserNotFound() {
  return (
    <div className="container py-12 flex flex-col items-center justify-center text-center space-y-6">
      <h1 className="text-4xl font-bold">User Not Found</h1>
      <p className="text-muted-foreground max-w-md">
        The user profile you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/">Go Home</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/auth/login">Login</Link>
        </Button>
      </div>
    </div>
  );
}
