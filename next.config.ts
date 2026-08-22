// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Add whatever host(s) your product images actually live on —
    // e.g. Supabase Storage, Cloudinary, your CDN, etc.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      // {
      //   protocol: "https",
      //   hostname: "images.unsplash.com",
      // },
    ],
  },
};

export default nextConfig;