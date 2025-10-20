import { getCollection, getEntries, type CollectionEntry } from 'astro:content';

type CategoryEntry = CollectionEntry<'categories'>;
type ArticleEntry = CollectionEntry<'articles'>;
type ArticleTranslationEntry = CollectionEntry<'articleTranslation'>;
type PlaceEntry = CollectionEntry<'places'>;

const SUPPORTED_LANGS = new Set(['fr', 'en', 'es']);

const normalizeSlug = (slug?: string | null) => (slug ?? '').trim().toLowerCase();

const isSupportedLang = (lang: string) => SUPPORTED_LANGS.has(lang);

const matchesCategorySlug = (category: CategoryEntry, lang: string, slug: string) => {
  const normalizedSlug = normalizeSlug(slug);
  if (!normalizedSlug) return false;

  const translations = Array.isArray(category.data.translations) ? category.data.translations : [];
  const translationMatch = translations.some((translation: any) => {
    if (!translation) return false;
    if (translation.langCode === lang && normalizeSlug(translation.seoSlug) === normalizedSlug) {
      return true;
    }
    return false;
  });

  if (translationMatch) return true;

  return normalizeSlug(category.data.slug) === normalizedSlug;
};

type ArticleSlugMatch = {
  translation: ArticleTranslationEntry | null;
};

const matchesArticleSlug = async (
  article: ArticleEntry,
  lang: string,
  slug: string,
): Promise<ArticleSlugMatch | null> => {
  const normalizedSlug = normalizeSlug(slug);
  if (!normalizedSlug) return null;

  const translationRefs = Array.isArray(article.data.translations) ? article.data.translations : [];
  if (translationRefs.length > 0) {
    const translations = await getEntries(translationRefs as any);
    const match = translations.find((translation: any) => {
      const data = translation?.data as any;
      if (!data) return false;
      const langMatches = data.langCode === lang || !isSupportedLang(lang);
      const slugMatches = normalizeSlug(data.seoSlug) === normalizedSlug;
      return langMatches && slugMatches;
    });

    if (match) {
      return { translation: match as ArticleTranslationEntry };
    }
  }

  const fallbackSlug = normalizeSlug((article.data as any).article_seo_slug ?? (article.data as any).seoSlug);
  if (fallbackSlug && fallbackSlug === normalizedSlug) {
    return { translation: null };
  }

  return null;
};

const matchesPlaceSlug = (place: PlaceEntry, lang: string, slug: string) => {
  const normalizedSlug = normalizeSlug(slug);
  if (!normalizedSlug) return { translation: null };

  const translations = Array.isArray(place.data.translations) ? place.data.translations : [];
  for (const translation of translations) {
    if (!translation) continue;
    const langMatches = translation.langCode === lang || !isSupportedLang(lang);
    if (langMatches && normalizeSlug(translation.seoSlug) === normalizedSlug) {
      return { translation };
    }
  }

  const fallbackSlug = normalizeSlug((place.data as any).seoSlug ?? (place.data as any).slug);
  if (fallbackSlug && fallbackSlug === normalizedSlug) {
    return { translation: null };
  }

  return null;
};

export async function findRootCategoryBySlug(lang: string, slug: string) {
  const normalizedLang = isSupportedLang(lang) ? lang : 'fr';
  const categories = await getCollection('categories');

  return categories.find((category) => {
    if (category.data.parentId) return false;
    return matchesCategorySlug(category, normalizedLang, slug);
  }) ?? null;
}

export async function findChildCategoryBySlug(parentId: string, lang: string, slug: string) {
  if (!parentId) return null;
  const normalizedLang = isSupportedLang(lang) ? lang : 'fr';
  const categories = await getCollection('categories');

  return categories.find((category) => {
    if (category.data.parentId !== parentId) return false;
    return matchesCategorySlug(category, normalizedLang, slug);
  }) ?? null;
}

export async function getCategoryById(categoryId: string) {
  const categories = await getCollection('categories');
  return categories.find((category) => category.id === categoryId) ?? null;
}

export async function findArticleBySlug(categoryId: string, lang: string, slug: string) {
  if (!categoryId) return null;
  const normalizedLang = isSupportedLang(lang) ? lang : 'fr';
  const articles = await getCollection('articles', ({ data }) => data.categoryId === categoryId);

  for (const article of articles) {
    const translationMatch = await matchesArticleSlug(article, normalizedLang, slug);
    if (translationMatch !== null) {
      return { article, translation: translationMatch.translation };
    }
  }

  return null;
}

export async function findPlaceBySlug(categoryId: string, lang: string, slug: string) {
  if (!categoryId) return null;
  const normalizedLang = isSupportedLang(lang) ? lang : 'fr';
  const places = await getCollection('places', ({ data }) => data.categoryId === categoryId);

  for (const place of places) {
    const match = matchesPlaceSlug(place, normalizedLang, slug);
    if (match) {
      return { place, translation: match.translation };
    }
  }

  return null;
}

export function getCategoryDefaultSlug(category: CategoryEntry, lang: string) {
  const normalizedLang = isSupportedLang(lang) ? lang : 'fr';
  const translations = Array.isArray(category.data.translations) ? category.data.translations : [];

  const translation = translations.find((item: any) => item?.langCode === normalizedLang)
    ?? translations[0]
    ?? null;

  if (translation?.seoSlug) {
    return translation.seoSlug;
  }

  return category.data.slug;
}