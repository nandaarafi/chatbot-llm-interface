/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      return [
        // Proxy chat streaming to FastAPI
        {
          source: '/api/chat/stream',
          destination: 'http://127.0.0.1:8000/chat/stream',
        },
        // Proxy file uploads to FastAPI
        {
          source: '/api/upload',
          destination: 'http://127.0.0.1:8000/upload',
        },
      ];
    }
    // In production, these will be handled by your Next.js API routes
    return [];
  },
};

module.exports = nextConfig;