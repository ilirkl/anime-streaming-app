import { SignUpForm } from '@/components/sign-up-form'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up | Anime Streaming App', // Updated title
  description: 'Create a new account to access all features',
}

export default function SignUpPage() { // Updated function name
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignUpForm />
      </div>
    </div>
  )
}
