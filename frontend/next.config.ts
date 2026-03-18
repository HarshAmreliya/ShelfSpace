import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === 'development';
const rawApiUrl = process.env["NEXT_PUBLIC_API_URL"];
const apiOrigin = rawApiUrl ? new URL(rawApiUrl).origin : 'http://localhost';

const imgSrc = "img-src 'self' data: blob: https://www.google-analytics.com https://images.gr-assets.com https://i.gr-assets.com https://covers.openlibrary.org https://books.google.com https://lh3.googleusercontent.com https://lh4.googleusercontent.com https://lh5.googleusercontent.com https://lh6.googleusercontent.com;";
const scriptSrc = isDev
  ? "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com;"
  : "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com;";
const connectSrc = isDev
  ? `connect-src 'self' ws: wss: http://localhost http://localhost:* ${apiOrigin} https://www.google-analytics.com https://region1.google-analytics.com;`
  : `connect-src 'self' ws: wss: ${apiOrigin} https://www.google-analytics.com https://region1.google-analytics.com;`;

const csp = `default-src 'self'; ${scriptSrc} style-src 'self' 'unsafe-inline'; ${imgSrc} font-src 'self' data:; ${connectSrc}`;

const nextConfig: NextConfig = {
  output: 'standalone',
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [{ key: 'Content-Security-Policy', value: csp }]
      }
    ];
  }
};

export default nextConfig;
