'use client';

import Link from 'next/link';
import { useI18n } from '@/i18n';

export function Footer() {
  const { t } = useI18n();
  
  return (
    <footer className="border-t border-border bg-muted/50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
            © {new Date().getFullYear()} RobuxStore. {t.footer.rights}
          </div>
          <div className="flex flex-wrap justify-center sm:justify-end gap-4 sm:gap-6">
            <Link href="/terms" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t.footer.terms}
            </Link>
            <Link href="/privacy" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t.footer.privacy}
            </Link>
            <a href="mailto:support@robuxstore.com" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t.footer.contact}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
