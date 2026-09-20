/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  allowedDevOrigins: ["192.168.0.106", "10.182.71.77"],

  experimental: {
    serverActions:{
      allowedOrigins:[
        'super-succotash-4qwj4x7xqj9cg97-3000.app.github.dev',
        'localhost:3000',
      ],
    },
  },
};

export default nextConfig;
