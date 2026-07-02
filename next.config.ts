import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  allowedDevOrigins: ['localhost', '10.0.0.84'],
  reactCompiler: true,
};

export default nextConfig;
