const createNextIntlPlugin = require("next-intl/plugin");
const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure voter JSON is bundled for ward-election API routes on Vercel
  experimental: {
    outputFileTracingIncludes: {
      "/api/ward-election/voters": ["./data/ward-election/**/*.json"],
      "/api/ward-election/chat": ["./data/ward-election/**/*.json"],
      "/api/ward-election/households": ["./data/ward-election/**/*.json"],
      "/api/ward-election/strategy": ["./data/ward-election/**/*.json"],
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.amazonaws.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

module.exports = withNextIntl(nextConfig);
