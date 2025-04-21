import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Privacy Policy | Anime Streaming App',
  description: 'Learn about how we collect, use, and protect your personal information on our anime streaming platform',
};

export default function PrivacyPage() {
  return (
    <div className="container max-w-4xl py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="text-muted-foreground">
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1. Introduction</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            At AnimeApp, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and
            safeguard your information when you use our anime streaming platform.
          </p>
          <p>
            Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please
            do not access our platform.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Information We Collect</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">We may collect information about you in various ways, including:</p>

          <h3 className="font-semibold mb-2">2.1 Personal Data</h3>
          <p className="mb-2">When you create an account, we may collect:</p>
          <ul className="list-disc pl-5 space-y-1 mb-4">
            <li>Name</li>
            <li>Email address</li>
            <li>Username</li>
            <li>Password (stored in encrypted form)</li>
          </ul>

          <h3 className="font-semibold mb-2">2.2 Usage Data</h3>
          <p className="mb-2">We may also collect information on how you use our service:</p>
          <ul className="list-disc pl-5 space-y-1 mb-4">
            <li>Viewing history</li>
            <li>Watchlist items</li>
            <li>Search queries</li>
            <li>Time spent watching content</li>
            <li>Device information (type, operating system, browser)</li>
            <li>IP address</li>
          </ul>

          <h3 className="font-semibold mb-2">2.3 Cookies and Tracking Technologies</h3>
          <p>
            We use cookies and similar tracking technologies to track activity on our platform and hold certain information.
            Cookies are files with a small amount of data that may include an anonymous unique identifier.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>3. How We Use Your Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-2">We may use the information we collect for various purposes, including to:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Provide, maintain, and improve our services</li>
            <li>Create and manage your account</li>
            <li>Process your subscription payments</li>
            <li>Provide personalized content recommendations</li>
            <li>Remember your preferences and settings</li>
            <li>Analyze usage patterns to improve user experience</li>
            <li>Communicate with you about updates, new features, or promotional offers</li>
            <li>Detect, prevent, and address technical issues or security breaches</li>
            <li>Comply with legal obligations</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>4. Data Sharing and Disclosure</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            We may share your information with third parties in certain situations, including:
          </p>

          <h3 className="font-semibold mb-2">4.1 Service Providers</h3>
          <p>
            We may employ third-party companies and individuals to facilitate our service, provide the service on our behalf,
            perform service-related tasks, or assist us in analyzing how our service is used. These third parties have access
            to your personal information only to perform these tasks on our behalf and are obligated not to disclose or use it
            for any other purpose.
          </p>

          <h3 className="font-semibold mb-2">4.2 Legal Requirements</h3>
          <p>
            We may disclose your information if required to do so by law or in response to valid requests by public authorities
            (e.g., a court or a government agency).
          </p>

          <h3 className="font-semibold mb-2">4.3 Business Transfers</h3>
          <p>
            If we are involved in a merger, acquisition, or asset sale, your personal information may be transferred. We will
            provide notice before your personal information is transferred and becomes subject to a different Privacy Policy.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>5. Data Security</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            We implement appropriate technical and organizational measures to protect the security of your personal information.
            However, please be aware that no method of transmission over the internet or method of electronic storage is 100%
            secure, and we cannot guarantee its absolute security.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>6. Your Data Rights</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-2">Depending on your location, you may have certain rights regarding your personal information, including:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>The right to access the personal information we have about you</li>
            <li>The right to request correction of inaccurate information</li>
            <li>The right to request deletion of your personal information</li>
            <li>The right to object to processing of your personal information</li>
            <li>The right to data portability</li>
            <li>The right to withdraw consent at any time</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
         <CardTitle>7. Children&apos;s Privacy</CardTitle>
         </CardHeader>
         <CardContent>
           <p>
             Our service is not intended for use by children under the age of 13. We do not knowingly collect personal
             information from children under 13. If we become aware that we have collected personal information from a child
             under 13 without verification of parental consent, we will take steps to remove that information from our servers.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>8. Changes to This Privacy Policy</CardTitle>
        </CardHeader>
         <CardContent>
           <p>
             We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy
             Policy on this page and updating the &quot;Last updated&quot; date. You are advised to review this Privacy Policy periodically
             for any changes.
           </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>9. Contact Us</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            If you have any questions about this Privacy Policy, please contact us at{' '}
            <span className="text-primary">privacy@animeapp.com</span>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
