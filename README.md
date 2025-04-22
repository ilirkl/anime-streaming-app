# Anime Streaming App

A modern web application for streaming and discovering anime, built with Next.js 15, TypeScript, Supabase, JikanAPI , Webtor and Tailwind CSS.

## 🌟 Features

- **Anime Library**: Browse a vast collection of anime series and movies
- **Genre-based Navigation**: Explore content through various genres
- **User Authentication**: Secure login/registration system via Supabase
- **Personalized Experience**: Watchlist, watch history, and recommendations
- **Responsive Design**: Optimized for all device sizes
- **Search Functionality**: Quick access to content with search shortcuts
- **Dark/Light Theme**: System-based and manual theme switching

## 🎬 Streaming Technology

### WebTor Integration

The application uses WebTor for seamless torrent streaming directly in the browser:

- **Browser-Based Streaming**: Stream torrent content without external software
- **Real-Time Playback**: Start watching before the download completes
- **Efficient Resource Usage**: Optimized memory and bandwidth consumption
- **Secure Implementation**: Client-side only, no server storage of content
- **Progress Tracking**: Real-time download status and peer information
- **Format Support**: Compatible with most video formats (MP4, MKV, WebM)

### Technical Implementation

```typescript
// WebTor initialization
window.webtor.push({
    id: 'webtor-player',
    magnet: magnetLink,
    width: '100%',
    features: {
        embed: false,
        settings: true
    }
});
```

### Security Considerations

- Content is streamed directly in the browser
- No permanent storage of streamed content
- CSP headers configured for secure operation
- Client-side only implementation

## 👑 Admin Features

Administrators have access to a dedicated dashboard with powerful content management capabilities:

- **Content Management**:
  - Add new anime series from MyAnimeList using MAL IDs
  - Update existing anime episodes and metadata
  - Monitor recently added/updated episodes
  - Manage anime categories and genres

- **Admin Dashboard**:
  - Quick access to all administrative functions
  - Activity tracking for content updates
  - Real-time status of recent changes

- **Access Control**:
  - Role-based authentication system
  - Secure admin-only routes and API endpoints
  - Activity logging for administrative actions

To access admin features:
1. Log in with an admin account
2. Click on your profile picture
3. Select "Admin Dashboard" from the dropdown menu

## 🛠 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database/Backend**: [Supabase](https://supabase.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/)
- **Components**: Radix UI primitives
- **State Management**: React Context
- **Media Player**: WebTor integration

## 🔄 Jikan API Integration

The application uses the Jikan API (時間, meaning "time" in Japanese) - an unofficial MyAnimeList API - to fetch comprehensive anime data. This integration enables automatic population of our database with verified anime information.

### Data Retrieved from Jikan

1. **Basic Anime Information**:
   - Titles (English, Japanese, and Romanized)
   - Synopsis/Plot summary
   - Cover images and promotional materials
   - Trailer URLs
   - Age rating (G, PG, PG-13, R, R+, Rx)
   - Airing status (ONGOING, COMPLETED, UPCOMING)
   - Release and end dates
   - MAL score/rating

2. **Episode Details**:
   - Episode numbers
   - Episode titles (multiple languages when available)
   - Episode synopses
   - Air dates
   - Duration
   - Filler/recap episode indicators
   - Japanese and English titles for each episode

3. **Metadata**:
   - MyAnimeList ID (MAL ID)
   - Series duration (e.g., "24 min per ep")
   - Total episode count
   - Series status
   - Broadcast information

### API Endpoints Used

```typescript
// Main anime details
GET https://api.jikan.moe/v4/anime/${malId}/full

// Episode information (paginated)
GET https://api.jikan.moe/v4/anime/${malId}/episodes?page=${page}

// Latest episodes for ongoing series
GET https://api.jikan.moe/v4/anime/${malId}/episodes?page=${lastPage}
```

### Data Transformation

The system automatically processes and transforms the data:

1. **Title Management**:
   ```typescript
   const displayTitle = anime.title_english || anime.title;
   const originalTitle = anime.title_japanese;
   ```

2. **Age Rating Conversion**:
   ```typescript
   'G - All Ages' → 'G'
   'PG - Children' → 'PG'
   'PG-13 - Teens 13 or older' → 'PG-13'
   'R - 17+ (violence & profanity)' → 'R'
   'R+ - Mild Nudity' → 'R+'
   'Rx - Hentai' → 'Rx'
   ```

3. **Status Mapping**:
   ```typescript
   'Currently Airing' → 'ONGOING'
   'Finished Airing' → 'COMPLETED'
   'Not yet aired' → 'UPCOMING'
   ```

4. **Runtime Parsing**:
   ```typescript
   "24 min per ep" → 24 (minutes)
   ```

### Automatic Updates

The system can automatically:
- Fetch new episodes for ongoing series
- Update series status and end dates
- Refresh ratings and metadata
- Add new episodes as they become available

### Example Response Structure

```typescript
{
  "data": {
    "mal_id": 30276,
    "title": "One Punch Man",
    "title_english": "One Punch Man",
    "title_japanese": "ワンパンマン",
    "synopsis": "The story of Saitama, a hero that...",
    "images": {
      "jpg": {
        "large_image_url": "https://cdn.myanimelist.net/..."
      }
    },
    "trailer": {
      "url": "https://www.youtube.com/..."
    },
    "rating": "PG-13 - Teens 13 or older",
    "status": "Currently Airing",
    "aired": {
      "from": "2015-10-05T00:00:00+00:00",
      "to": "2015-12-21T00:00:00+00:00"
    },
    "episodes": 12,
    "duration": "24 min per ep",
    "score": 8.50
  }
}
```

## 🗄️ Database Structure

### Tables Overview

```sql
profiles       # User profiles extending auth.users
animes        # Main anime information
seasons       # Anime seasons
episodes      # Episode details
watchlist     # User watchlists
watch_history # User viewing history
```

### Custom Types

```sql
age_rating    # G, PG, PG-13, R, R+, Rx
anime_status  # ONGOING, COMPLETED, UPCOMING
user_role     # USER, ADMIN, MODERATOR
```

### Security Features

- **Row Level Security (RLS)** enabled on all tables
- Role-based access control
- Granular policies for different access levels
- Automatic user profile creation
- Secure admin-only content management

### Key Relationships

```
auth.users ─┬─► profiles
            │
animes ─────┬─► seasons ─► episodes
            │
            ├─► watchlist
            │
            └─► watch_history
```

### Access Policies

- **Public Access**:
  - View anime, seasons, and episodes
  - View public profile information

- **User Access**:
  - Manage own profile
  - Create/manage watchlist
  - Track watch history

- **Admin Access**:
  - Add/update anime content
  - Manage episodes and seasons
  - Full content management capabilities

### Database Setup

1. Ensure Supabase CLI is installed:
```bash
npm install -g supabase
```

2. Initialize Supabase (if not already done):
```bash
supabase init
```

3. Apply the database migration:
```bash
supabase migration up
```

4. Verify the setup in Supabase Dashboard:
   - Check tables and relationships
   - Verify RLS policies
   - Test access controls

### Automatic Features

- Timestamps (`created_at`, `updated_at`) auto-update
- New user profiles auto-created
- Indexes for optimal query performance
- Cascading deletes for related records

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/anime-streaming-app.git
cd anime-streaming-app
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Create a `.env.local` file with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🗄️ Project Structure

```
src/
├── app/                 # Next.js app router pages
├── components/         # Reusable React components
│   ├── anime/         # Anime-specific components
│   ├── layout/        # Layout components
│   ├── ui/            # Base UI components
│   └── ...
├── lib/               # Utilities and core logic
└── hooks/             # Custom React hooks
```

## 🔒 Security

- CSP headers configured for security
- Authentication handled by Supabase
- Environment variables properly managed
- API routes protected with middleware

## 🚀 Deployment

The application is optimized for deployment on [Vercel](https://vercel.com). Follow these steps:

1. Push your code to GitHub
2. Import your repository to Vercel
3. Configure environment variables
4. Deploy!

## 📝 License

[MIT License](LICENSE)

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📸 Screenshots

### User Dashboard
![User Dashboard](https://imgur.com/a/WAX8rSU)
*Main dashboard featuring trending anime, latest episodes, and genre-based navigation*

### Admin Dashboard
![Admin Dashboard](https://imgur.com/a/MHUiKp6)
*Admin interface for managing anime content and monitoring recent updates*




