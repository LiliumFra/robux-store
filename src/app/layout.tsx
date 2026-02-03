import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';
import { I18nProvider } from '@/i18n';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://robux-store.vercel.app'),
  title: {
    default: 'RobuxStore - Buy Robux Safely | Compra Robux Seguros',
    template: '%s | RobuxStore',
  },
  description: 'The fastest and safest way to buy Robux with cryptocurrency. Automatic delivery in minutes. | La forma más rápida y segura de comprar Robux con criptomonedas.',
  keywords: ['Robux', 'buy Robux', 'comprar Robux', 'crypto', 'gamepass', 'Roblox', 'USDT', 'LTC', 'Bitcoin'],
  authors: [{ name: 'RobuxStore' }],
  creator: 'RobuxStore',
  publisher: 'RobuxStore',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en',
      'es-ES': '/es',
    },
  },
  openGraph: {
    title: 'RobuxStore - Buy Robux with Crypto',
    description: 'Get Robux fast and secure. Pay with LTC, BTC, ETH or USDT.',
    url: 'https://robux-store.vercel.app',
    siteName: 'RobuxStore',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/opengraph-image.png', // Ensure this file exists or update path
        width: 1200,
        height: 630,
        alt: 'RobuxStore Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RobuxStore - Buy Robux with Crypto',
    description: 'Get Robux fast and secure. Pay with LTC, BTC, ETH or USDT.',
    creator: '@robuxstore', // Placeholder
    images: ['/opengraph-image.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'RobuxStore',
              description: 'Buy Robux with cryptocurrency safely and fast',
              url: process.env.NEXT_PUBLIC_APP_URL || 'https://robux-store.vercel.app',
            }),
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <I18nProvider>
            {children}
            <Toaster />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
