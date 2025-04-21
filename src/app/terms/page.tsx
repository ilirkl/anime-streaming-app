import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Terms of Service | Anime Streaming App',
  description: 'Read our terms of service and user agreement for using our anime streaming platform',
};

export default function TermsPage() {
  return (
    <div className="container max-w-4xl py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
        <p className="text-muted-foreground">
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1. Acceptance of Terms</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            By accessing or using AnimeApp, you agree to be bound by these Terms of Service. If you do not agree to these terms,
            please do not use our service.
          </p>
          <p>
            We reserve the right to modify these terms at any time. Your continued use of AnimeApp after any changes indicates
            your acceptance of the modified terms.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. User Accounts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            To access certain features of our service, you may need to create an account. You are responsible for maintaining
            the confidentiality of your account information and for all activities that occur under your account.
          </p>
          <p>
            You agree to provide accurate and complete information when creating your account and to update your information
            to keep it accurate and current.
          </p>
          <p>
            We reserve the right to suspend or terminate your account if any information provided is found to be inaccurate,
            incomplete, or violates these terms.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>3. Content and Licensing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            All content provided on AnimeApp, including but not limited to anime series, movies, images, and text, is owned by
            or licensed to us and is subject to copyright and other intellectual property rights.
          </p>
          <p>
            You may access and view the content for personal, non-commercial use only. You may not download, copy, reproduce,
            distribute, transmit, broadcast, display, sell, license, or otherwise exploit any content for any other purpose
            without the prior written consent of the respective owners.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>4. Prohibited Conduct</CardTitle>
        </CardHeader>
        <CardContent>
           <p>You agree not to:</p>
           <ul className="list-disc pl-5 space-y-2 mt-2">
             <li>Use our service for any illegal purpose or in violation of any laws</li>
             <li>Violate or infringe other people&apos;s intellectual property, privacy, or other rights</li>
             <li>Interfere with or disrupt our service or servers</li>
             <li>Attempt to gain unauthorized access to any part of our service</li>
            <li>Use our service to transmit viruses or other harmful code</li>
            <li>Harass, abuse, or harm another person</li>
            <li>Share your account credentials with others</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>5. Limitation of Liability</CardTitle>
        </CardHeader>
         <CardContent className="space-y-4">
           <p>
             AnimeApp is provided &quot;as is&quot; without warranties of any kind, either express or implied. We do not guarantee that
             our service will be uninterrupted, secure, or error-free.
           </p>
          <p>
            In no event shall we be liable for any indirect, incidental, special, consequential, or punitive damages, including
            without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to
            or use of or inability to access or use the service.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>6. Termination</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            We may terminate or suspend your account and access to our service immediately, without prior notice or liability,
            for any reason, including without limitation if you breach these Terms of Service.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>7. Contact Us</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            If you have any questions about these Terms of Service, please contact us at{' '}
            <span className="text-primary">legal@animeapp.com</span>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
