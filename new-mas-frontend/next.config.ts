import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images:{
    remotePatterns:[{protocol:'https',hostname:'c.animaapp.com'}]
  }
};

export default nextConfig;
