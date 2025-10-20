import { getCategoryDefaultSlug } from '@utils/contentLookup';
import type { CollectionEntry } from 'astro:content';

type CategoryEntry = CollectionEntry<'categories'>;

export type LocalizedCategory = {
  entry: CategoryEntry;
  id: string;
  name: string;
  description: string | null;
  slug: string;
  iconName: string | null;
  translationLang: string;
};

const SUPPORTED_LANGS = new Set(['fr', 'en', 'es']);

const normalizeLang = (lang: string) => (SUPPORTED_LANGS.has(lang) ? lang : 'fr');

export const pickCategoryTranslation = (category: CategoryEntry, lang: string) => {
  const normalized = normalizeLang(lang);
  const translations = Array.isArray(category.data.translations) ? category.data.translations : [];

  return (
    translations.find((translation: any) => translation?.langCode === normalized)
    ?? translations[0]
    ?? null
  );
};

export const toLocalizedCategory = (category: CategoryEntry, lang: string): LocalizedCategory => {
  const translation = pickCategoryTranslation(category, lang);
  const slug = getCategoryDefaultSlug(category, lang) ?? category.data.slug;

  return {
    entry: category,
    id: category.id,
    name: translation?.name ?? category.data.slug,
    description: translation?.description ?? null,
    slug,
    iconName: (category.data as any).iconName ?? null,
    translationLang: translation?.langCode ?? 'fr',
  };
};

export const buildCategoryMap = (categories: CategoryEntry[], lang: string) => {
  const map = new Map<string, LocalizedCategory>();
  for (const category of categories) {
    map.set(category.id, toLocalizedCategory(category, lang));
  }
  return map;
};
