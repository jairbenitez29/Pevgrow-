import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ps9.pevgrow.com',
      },
      {
        protocol: 'https',
        hostname: 'pevgrow.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },
  env: {
    PRESTASHOP_API_URL: process.env.PRESTASHOP_API_URL,
    PRESTASHOP_IMAGE_URL: process.env.PRESTASHOP_IMAGE_URL,
    PRESTASHOP_HTACCESS_USER: process.env.PRESTASHOP_HTACCESS_USER,
    PRESTASHOP_HTACCESS_PASSWORD: process.env.PRESTASHOP_HTACCESS_PASSWORD,
  },
};

export default withNextIntl(nextConfig);
