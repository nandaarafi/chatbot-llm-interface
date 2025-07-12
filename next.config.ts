/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      return [
        // Proxy chat streaming to FastAPI
        {
          source: '/api/chat',
          destination: 'http://127.0.0.1:8080/chat/stream',
        },
        // Proxy file uploads to FastAPI
      ];
    }
    else {
      return [
        {
          source: '/api/chat',
          destination: `${process.env.API_BASE_URL}/chat/stream`,
        },
        {
          source: '/api/upload',
          destination: `${process.env.API_BASE_URL}/upload`,
        },
      ];
    }
  },
};

module.exports = nextConfig;