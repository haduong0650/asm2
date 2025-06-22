import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['xyz.supabase.co', 'images.unsplash.com', 'res.cloudinary.com'], // Thay bằng domain ảnh thật của bạn
  },
};

export default nextConfig;
