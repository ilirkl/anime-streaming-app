'use client';

// This function suppresses Supabase auth errors in the console
// It should be called in the client-side components that use Supabase auth
export function suppressAuthErrors() {
  // Store the original console.error function
  const originalConsoleError = console.error;

  // Override console.error to filter out Supabase auth errors
  console.error = function(...args) {
    // Check if the error is related to Supabase auth session
    const errorString = args.join(' ');
    if (
      errorString.includes('Auth session missing') || 
      errorString.includes('AuthSessionMissingError') ||
      errorString.includes('supabase_auth') ||
      errorString.includes('SupabaseAuthClient')
    ) {
      // Silently ignore these errors
      return;
    }
    
    // Pass other errors to the original console.error
    originalConsoleError.apply(console, args);
  };

  // Return a function to restore the original console.error if needed
  return () => {
    console.error = originalConsoleError;
  };
}
