// Utilitaire DRY pour obtenir la traduction selon la langue
export function getTranslation(entry: any, lang: string) {
  if (!entry || !entry.translations) return {};
  return (
    entry.translations.find((t: any) => t.langCode === lang)
    || entry.translations[0]
    || {}
  );
}