import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppLayout } from "@/components/layout/AppLayout";
import "./globals.css";
import { getUser } from "@/lib/server";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { SearchShortcut, SearchProvider } from "@/components/search/SearchShortcut";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Anime Streaming App",
  description: "Watch your favorite anime series and movies.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          src="https://cdn.jsdelivr.net/npm/@webtor/embed-sdk-js/dist/index.min.js"
          charSet="utf-8"
          async
        ></script>
      </head>
      <body className={inter.className}>
        <ThemeProvider defaultTheme="system" storageKey="anime-app-theme">
          <SearchProvider>
            <AppLayout user={user}>
              {children}
            </AppLayout>
            <Toaster position="top-right" richColors />
            <SearchShortcut />
          </SearchProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
