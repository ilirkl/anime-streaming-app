# Anime Streaming App

A modern web application for streaming and discovering anime, built with Next.js 15, TypeScript, Supabase, and Tailwind CSS.

## 🌟 Features

- **Anime Library**: Browse a vast collection of anime series and movies
- **Genre-based Navigation**: Explore content through various genres
- **User Authentication**: Secure login/registration system via Supabase
- **Personalized Experience**: Watchlist, watch history, and recommendations
- **Responsive Design**: Optimized for all device sizes
- **Search Functionality**: Quick access to content with search shortcuts
- **Dark/Light Theme**: System-based and manual theme switching

## 🛠 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database/Backend**: [Supabase](https://supabase.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/)
- **Components**: Radix UI primitives
- **State Management**: React Context
- **Media Player**: WebTor integration

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
