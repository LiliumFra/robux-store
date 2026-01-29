import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';
import { I18nProvider } from '@/i18n';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RobuxStore - Buy Robux Safely | Compra Robux Seguros',
  description: 'The fastest and safest way to buy Robux with cryptocurrency. Automatic delivery in minutes. | La forma más rápida y segura de comprar Robux con criptomonedas.',
  keywords: ['Robux', 'buy Robux', 'comprar Robux', 'crypto', 'gamepass', 'Roblox'],
  authors: [{ name: 'RobuxStore' }],
  openGraph: {
    title: 'RobuxStore - Buy Robux with Crypto',
    description: 'Get Robux fast and secure. Pay with LTC, BTC, ETH or USDT.',
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RobuxStore - Buy Robux with Crypto',
    description: 'Get Robux fast and secure. Pay with LTC, BTC, ETH or USDT.',
  },
  robots: {
    index: true,
    follow: true,
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
