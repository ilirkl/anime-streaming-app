import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'About Us | Anime Streaming App',
  description: 'Learn more about our anime streaming platform, our mission, and what we offer',
};

export default function AboutPage() {
  return (
    <div className="container max-w-4xl py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">About Us</h1>
        <p className="text-muted-foreground">
          Learn more about our anime streaming platform
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Our Mission</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Welcome to AnimeApp, a platform dedicated to bringing you the best anime content from around the world.
            Our mission is to create a community where anime fans can discover, watch, and share their favorite series and movies.
           </p>
           <p>
             We believe that anime is more than just entertainment—it&apos;s an art form that brings together diverse stories,
             cultures, and perspectives. Our platform aims to make these stories accessible to everyone, regardless of where they are.
           </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What We Offer</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2">
            <li>A vast library of anime series and movies across various genres</li>
            <li>High-quality streaming with multiple resolution options</li>
            <li>Personalized recommendations based on your watching history</li>
            <li>User-friendly interface for seamless navigation</li>
            <li>Watchlist feature to keep track of what you want to watch</li>
            <li>Regular updates with the latest anime releases</li>
            <li>Community features to connect with other anime enthusiasts</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Our Story</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            AnimeApp was founded by a group of passionate anime fans who wanted to create a better way to discover and enjoy anime.
            What started as a small project has grown into a platform loved by thousands of users around the world.
           </p>
           <p>
             We&apos;re constantly working to improve our platform, add new features, and expand our content library.
             Our team is dedicated to providing the best possible experience for our users, and we&apos;re always open to feedback and suggestions.
           </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
         <CardTitle>Contact Us</CardTitle>
         </CardHeader>
         <CardContent>
           <p>
             Have questions, suggestions, or feedback? We&apos;d love to hear from you!
             You can reach our team at <span className="text-primary">support@animeapp.com</span>.
           </p>
        </CardContent>
      </Card>
    </div>
  );
}
