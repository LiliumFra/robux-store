'use client';

import { useI18n } from '@/i18n';

export function LanguageToggle() {
  const { locale, setLocale } = useI18n();

  return (
    <button
      onClick={() => setLocale(locale === 'es' ? 'en' : 'es')}
      className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
      aria-label="Toggle language"
    >
      <span className="text-base">{locale === 'es' ? '🇪🇸' : '🇺🇸'}</span>
      <span className="uppercase">{locale}</span>
    </button>
  );
}
