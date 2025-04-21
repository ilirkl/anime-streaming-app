/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.myanimelist.net',
      },
      {
        protocol: 'https',
        hostname: 'img.animeschedule.net',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'api.jikan.moe',
      },
      {
        protocol: 'https',
        hostname: 'cdn.noitatnemucod.net',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    }
  },
  async headers() {
    const cspHeader = `
      default-src 'self';
      connect-src 'self' https://qpnsrxreqyvajqriurtf.supabase.co https://fonts.googleapis.com;
      media-src 'self' magnet:;
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com;
      style-src 'self' 'unsafe-inline';
      img-src 'self' blob: data: https://cdn.myanimelist.net https://img.animeschedule.net https://via.placeholder.com https://api.jikan.moe https://cdn.noitatnemucod.net https://img.freepik.com;
      frame-src 'self' https://webtor.io https://www.youtube.com https://m.youtube.com;
      font-src 'self' https://fonts.googleapis.com;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
      upgrade-insecure-requests;
    `
      // Note: 'unsafe-inline' and 'unsafe-eval' for script-src are often needed for development
      // due to Next.js HMR and some libraries. Consider tightening this for production.
      // Added jsdelivr.net to script-src for WebTorrent and EmbedSDK.
      // Added existing image domains to img-src. Added blob: and data: for potential image sources.

    return [
      {
        source: '/(.*)', // Apply CSP to all routes
        headers: [
          {
            key: 'Content-Security-Policy',
            // Replace newline characters and multiple spaces for header value
            value: cspHeader.replace(/\s{2,}/g, ' ').trim(),
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
