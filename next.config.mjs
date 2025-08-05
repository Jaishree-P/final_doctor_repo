/** @type {import('next').NextConfig} */
const nextConfig = {
 // output: 'export', // ✅ Add this line
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
