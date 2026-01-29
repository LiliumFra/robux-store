'use client';

import Link from 'next/link';
import { useI18n } from '@/i18n';
import { LanguageToggle } from './language-toggle';
import { ThemeToggle } from './theme-toggle';

export function Navbar() {
  const { t } = useI18n();
  
  return (
    <nav className="border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">RobuxStore</span>
          </Link>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="hidden sm:inline">{t.nav.cryptoPayment}</span>
          <span className="hidden md:inline">{t.nav.autoDelivery}</span>
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
