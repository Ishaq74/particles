import { getCollection, getEntries, getEntry, type CollectionEntry } from 'astro:content';
import type { EntityConfig } from '@lib/entityRegistry';
import { buildCategoryMap, toLocalizedCategory, type LocalizedCategory } from '@utils/category';

type ArticleEntry = CollectionEntry<'articles'>;
type ArticleTranslationEntry = CollectionEntry<'articleTranslation'>;
type AuthorEntry = CollectionEntry<'authors'>;

const SUPPORTED_LANGS = new Set(['fr', 'en', 'es']);

const normalizeLang = (lang: string) => (SUPPORTED_LANGS.has(lang) ? lang : 'fr');

export type ArticleSummary = {
  article: ArticleEntry;
  author: AuthorEntry | null;
  title: string;
  summary: string;
  article_featured_image_url?: string | null;
  article_featured_image_alt?: string | null;
  category_icon_name?: string | null;
  category_name?: string;
  category_seo_slug?: string;
  article_seo_slug?: string;
  publication_date?: string;
  read_time_minutes?: number;
  view_count?: number;
};

export type ArticleCollections = {
  rootCategory: LocalizedCategory | null;
  childCategories: LocalizedCategory[];
  categoryCounts: Map<string, number>;
  articlesByCategory: Map<string, ArticleSummary[]>;
  categoryMap: Map<string, LocalizedCategory>;
  featured: ArticleSummary[];
  recent: ArticleSummary[];
  popular: ArticleSummary[];
};

const createMutableSummaryStore = () => ({
  featured: [] as ArticleSummary[],
  recent: [] as ArticleSummary[],
  popular: [] as ArticleSummary[],
});

const resolveArticleTranslation = async (article: ArticleEntry, lang: string) => {
  const normalizedLang = normalizeLang(lang);
  const translationRefs = Array.isArray(article.data.translations) ? article.data.translations : [];

  if (translationRefs.length > 0) {
    const entries = await getEntries(translationRefs as any);
    const typedEntries = entries as ArticleTranslationEntry[];
    return (
      typedEntries.find((entry) => entry?.data?.langCode === normalizedLang)
      ?? typedEntries[0]
      ?? null
    );
  }

  return null;
};

const resolveAuthor = async (
  article: ArticleEntry,
  authorCache: Map<string, AuthorEntry | null>,
) => {
  const authorRef = (article.data as any).author;
  if (!authorRef?.id) return null;

  if (authorCache.has(authorRef.id)) {
    return authorCache.get(authorRef.id) ?? null;
  }

  const fetched = await getEntry('authors', authorRef.id);
  const author = fetched ?? null;
  authorCache.set(authorRef.id, author);
  return author;
};

const buildArticleSummary = async (
  article: ArticleEntry,
  lang: string,
  categoryMap: Map<string, LocalizedCategory>,
  authorCache: Map<string, AuthorEntry | null>,
) => {
  const translation = await resolveArticleTranslation(article, lang);
  const author = await resolveAuthor(article, authorCache);
  const categoryId = (article.data as any).categoryId ?? (article.data as any).category?.id ?? '';
  const category = categoryId ? categoryMap.get(categoryId) : undefined;

  return {
    article,
    author,
    title: translation?.data?.name ?? (article.data as any).article_title ?? article.id,
    summary: translation?.data?.description ?? (article.data as any).article_summary ?? '',
    article_featured_image_url: (article.data as any).featuredImageUrl ?? (article.data as any).article_featured_image_url ?? null,
    article_featured_image_alt: translation?.data?.featuredImageAlt ?? (article.data as any).article_featured_image_alt ?? null,
    category_icon_name: category?.iconName ?? ((article.data as any).category_icon_name ?? null),
    category_name: category?.name ?? (article.data as any).category_name ?? '',
    category_seo_slug: category?.slug ?? (article.data as any).category_seo_slug ?? '',
    article_seo_slug: translation?.data?.seoSlug ?? (article.data as any).article_seo_slug ?? article.id,
    publication_date: ((article.data as any).publicationDate ?? (article.data as any).publication_date ?? null) ?? undefined,
    read_time_minutes: (article.data as any).readTimeMinutes ?? (article.data as any).read_time_minutes ?? undefined,
    view_count: (article.data as any).viewCount ?? (article.data as any).view_count ?? undefined,
  } satisfies ArticleSummary;
};

export const loadArticleCollections = async (entityConfig: EntityConfig, lang: string): Promise<ArticleCollections> => {
  const normalizedLang = normalizeLang(lang);
  const categories = await getCollection('categories');

  const rootEntry = categories.find((category) => category.id === entityConfig.rootCategoryId) ?? null;
  const childEntries = categories.filter((category) => category.data.parentId === entityConfig.rootCategoryId);

  const categoryMap = buildCategoryMap(childEntries, normalizedLang);
  const articles = await getCollection('articles', ({ data }) => data.categoryId && categoryMap.has(data.categoryId));

  const summariesByCategory = new Map<string, ArticleSummary[]>();
  const counts = new Map<string, number>();
  const store = createMutableSummaryStore();
  const authorCache = new Map<string, AuthorEntry | null>();

  for (const article of articles) {
    const summary = await buildArticleSummary(article, normalizedLang, categoryMap, authorCache);
    const categoryId = (article.data as any).categoryId;
    if (!categoryId) continue;

    const list = summariesByCategory.get(categoryId) ?? [];
    list.push(summary);
    summariesByCategory.set(categoryId, list);

    counts.set(categoryId, (counts.get(categoryId) ?? 0) + 1);

    if ((article.data as any).isFeatured) {
      store.featured.push(summary);
    }
  }

  const flattened = Array.from(summariesByCategory.values()).flat();

  const sortByPublicationDate = (a: ArticleSummary, b: ArticleSummary) => {
    const dateA = a.publication_date ? new Date(a.publication_date).getTime() : 0;
    const dateB = b.publication_date ? new Date(b.publication_date).getTime() : 0;
    return dateB - dateA;
  };

  const sortByViewCount = (a: ArticleSummary, b: ArticleSummary) => {
    const viewsA = a.view_count ?? 0;
    const viewsB = b.view_count ?? 0;
    return viewsB - viewsA;
  };

  store.featured.sort(sortByPublicationDate);
  store.recent = [...flattened].sort(sortByPublicationDate);
  store.popular = [...flattened].sort(sortByViewCount);

  return {
    rootCategory: rootEntry ? toLocalizedCategory(rootEntry, normalizedLang) : null,
    childCategories: childEntries.map((entry) => toLocalizedCategory(entry, normalizedLang)),
    categoryCounts: counts,
    articlesByCategory: summariesByCategory,
    featured: store.featured.slice(0, 4),
    recent: store.recent.slice(0, 6),
    popular: store.popular.slice(0, 5),
    categoryMap,
  };
};

export const loadArticlesForCategory = async (
  entityConfig: EntityConfig,
  categoryId: string,
  lang: string,
) => {
  const collections = await loadArticleCollections(entityConfig, lang);
  return {
    ...collections,
    currentCategory: collections.childCategories.find((category) => category.id === categoryId) ?? null,
    articles: collections.articlesByCategory.get(categoryId) ?? [],
    popular: (collections.articlesByCategory.get(categoryId) ?? [])
      .slice()
      .sort((a, b) => (b.view_count ?? 0) - (a.view_count ?? 0))
      .slice(0, 5),
  };
};

export const loadArticleCategorySummaries = async (parentCategoryId: string, lang: string) => {
  const normalizedLang = normalizeLang(lang);
  const categories = await getCollection('categories');
  const childEntries = categories.filter((category) => category.data.parentId === parentCategoryId);
  const categoryMap = buildCategoryMap(childEntries, normalizedLang);
  const articles = await getCollection('articles', ({ data }) => data.categoryId && categoryMap.has(data.categoryId));

  const counts = new Map<string, number>();
  for (const article of articles) {
    const categoryId = (article.data as any).categoryId;
    if (!categoryId) continue;
    counts.set(categoryId, (counts.get(categoryId) ?? 0) + 1);
  }

  return childEntries.map((entry) => {
    const localized = categoryMap.get(entry.id);
    return {
      id: entry.id,
      name: localized?.name ?? entry.data.slug,
      slug: localized?.slug ?? entry.data.slug,
      count: counts.get(entry.id) ?? 0,
    };
  });
};

export type ArticleDetail = {
  article: ArticleEntry;
  translation: ArticleTranslationEntry | null;
  author: AuthorEntry | null;
  category: LocalizedCategory | null;
  title: string;
  summary: string;
  content: string;
  featuredImageUrl: string | null | undefined;
  featuredImageAlt: string | null | undefined;
  seoSlug: string;
  publicationDate?: string;
  readTimeMinutes?: number;
  viewCount?: number;
};

export const loadArticleDetail = async (
  entityConfig: EntityConfig,
  article: ArticleEntry,
  lang: string,
  translationOverride?: ArticleTranslationEntry | null,
) => {
  const normalizedLang = normalizeLang(lang);
  const collections = await loadArticleCollections(entityConfig, normalizedLang);
  const authorCache = new Map<string, AuthorEntry | null>();

  const translation = translationOverride ?? await resolveArticleTranslation(article, normalizedLang);
  const author = await resolveAuthor(article, authorCache);
  const categoryId = (article.data as any).categoryId ?? (article.data as any).category?.id ?? '';
  const categoryEntry = categoryId ? await getEntry('categories', categoryId) : null;
  const localizedCategory = categoryEntry ? toLocalizedCategory(categoryEntry, normalizedLang) : null;

  if (author && author.id) {
    authorCache.set(author.id, author);
  }

  const detail: ArticleDetail = {
    article,
    translation,
    author,
    category: localizedCategory,
    title: translation?.data?.name ?? (article.data as any).article_title ?? article.id,
    summary: translation?.data?.description ?? (article.data as any).article_summary ?? '',
    content: translation?.data?.content ?? (article.data as any).article_body ?? '',
    featuredImageUrl: (article.data as any).featuredImageUrl ?? (article.data as any).article_featured_image_url ?? null,
    featuredImageAlt: translation?.data?.featuredImageAlt ?? (article.data as any).article_featured_image_alt ?? null,
    seoSlug: translation?.data?.seoSlug ?? (article.data as any).article_seo_slug ?? article.id,
    publicationDate: ((article.data as any).publicationDate ?? (article.data as any).publication_date ?? null) ?? undefined,
    readTimeMinutes: (article.data as any).readTimeMinutes ?? (article.data as any).read_time_minutes ?? undefined,
    viewCount: (article.data as any).viewCount ?? (article.data as any).view_count ?? undefined,
  };

  const sameCategorySummaries = categoryId
    ? (collections.articlesByCategory.get(categoryId) ?? [])
    : [];

  const siblings = sameCategorySummaries
    .filter((summary) => summary.article.id !== article.id)
    .slice(0, 4);

  const popular = sameCategorySummaries
    .slice()
    .sort((a, b) => (b.view_count ?? 0) - (a.view_count ?? 0))
    .filter((summary) => summary.article.id !== article.id)
    .slice(0, 5);

  const relatedRefs = Array.isArray((article.data as any).relatedArticles)
    ? (article.data as any).relatedArticles
    : [];
  const relatedEntries = relatedRefs.length > 0 ? await getEntries(relatedRefs as any) : [];
  const relatedSummaries: ArticleSummary[] = [];
  for (const entry of relatedEntries) {
    if (!entry) continue;
    const relatedArticle = entry as ArticleEntry;
    const summary = await buildArticleSummary(relatedArticle, normalizedLang, collections.categoryMap, authorCache);
    if (summary.article.id !== article.id) {
      relatedSummaries.push(summary);
    }
  }

  return {
    detail,
    rootCategory: collections.rootCategory,
    childCategories: collections.childCategories,
    siblings,
    popular,
    related: relatedSummaries,
  };
};
