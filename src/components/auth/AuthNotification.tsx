'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, X } from 'lucide-react';
import Link from 'next/link';

interface AuthNotificationProps {
  currentPath?: string;
  className?: string;
}

export function AuthNotification({ currentPath, className = '' }: AuthNotificationProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return null;
  }

  const loginUrl = currentPath 
    ? `/auth/login?next=${encodeURIComponent(currentPath)}`
    : '/auth/login';

  return (
    <Alert className={`relative ${className}`}>
      <Info className="h-4 w-4" />
      <AlertTitle>Sign in to unlock all features</AlertTitle>
      <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
        <span>Create an account to save your watchlist and track your watch history.</span>
        <div className="flex gap-2 mt-2 sm:mt-0">
          <Button size="sm" asChild>
            <Link href={loginUrl}>Sign In</Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href="/auth/sign-up">Register</Link>
          </Button>
        </div>
      </AlertDescription>
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-2 right-2 h-6 w-6"
        onClick={() => setDismissed(true)}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Dismiss</span>
      </Button>
    </Alert>
  );
}
