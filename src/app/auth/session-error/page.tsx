import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface AuthSessionErrorPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AuthSessionErrorPage({ searchParams }: AuthSessionErrorPageProps) {
  // Await the searchParams Promise
  const resolvedSearchParams = await searchParams;

  // Ensure error and returnTo are strings, handling potential string[] case (though unlikely here)
  const errorParam = resolvedSearchParams?.error;
  const returnToParam = resolvedSearchParams?.returnTo;

  const error = typeof errorParam === 'string' ? errorParam : 'Authentication session is missing or invalid';
  const returnTo = typeof returnToParam === 'string' ? returnToParam : '/';

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Authentication Error</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {error}
              </p>
              <p className="text-sm">
                Your session may have expired or been invalidated. Please try logging in again.
              </p>
              <div className="flex gap-4 pt-2">
                <Button asChild>
                  <Link href="/auth/login">Log In</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href={returnTo}>Go Back</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
