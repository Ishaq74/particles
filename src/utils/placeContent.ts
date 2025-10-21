import { getCollection, type CollectionEntry } from 'astro:content';
import type { EntityConfig } from '@lib/entityRegistry';
import { buildCategoryMap, toLocalizedCategory, type LocalizedCategory } from '@utils/category';

type PlaceEntry = CollectionEntry<'places'>;

const SUPPORTED_LANGS = new Set(['fr', 'en', 'es']);

const normalizeLang = (lang: string) => (SUPPORTED_LANGS.has(lang) ? lang : 'fr');

type PlaceTranslation = {
  langCode?: string;
  name?: string;
  description?: string;
  seoSlug?: string;
};

export type AccommodationSummary = {
  entry: PlaceEntry;
  accommodation: {
    id: string;
    name: string;
    summary?: string;
    main_image_url?: string | null;
    seo_slug: string;
    price_per_night?: number | null;
    capacity?: number | null;
    category_id: string;
    category_name?: string;
    category_seo_slug?: string;
  };
};

export type PlaceCollections = {
  rootCategory: LocalizedCategory | null;
  childCategories: LocalizedCategory[];
  categoryCounts: Map<string, number>;
  placesByCategory: Map<string, AccommodationSummary[]>;
  featured: AccommodationSummary[];
  recent: AccommodationSummary[];
  popular: AccommodationSummary[];
  categoryMap: Map<string, LocalizedCategory>;
};

export type PlaceDetail = {
  place: PlaceEntry;
  translation: PlaceTranslation | null;
  category: LocalizedCategory | null;
  title: string;
  summary?: string;
  imageUrl?: string | null;
  seoSlug: string;
  pricePerNight?: number | null;
  capacity?: number | null;
  amenities: string[];
  checkInTime?: string | null;
  checkOutTime?: string | null;
};

export type PlaceDetailResult = {
  detail: PlaceDetail;
  rootCategory: LocalizedCategory | null;
  childCategories: LocalizedCategory[];
  siblings: AccommodationSummary[];
  popular: AccommodationSummary[];
  related: AccommodationSummary[];
};

const pickPlaceTranslation = (place: PlaceEntry, lang: string): PlaceTranslation | null => {
  const normalized = normalizeLang(lang);
  const translations = Array.isArray((place.data as any).translations) ? (place.data as any).translations : [];
  return (
    translations.find((translation: PlaceTranslation) => translation?.langCode === normalized)
    ?? translations[0]
    ?? null
  );
};

const buildAccommodationSummary = (
  place: PlaceEntry,
  lang: string,
  categoryMap: Map<string, LocalizedCategory>,
): AccommodationSummary => {
  const translation = pickPlaceTranslation(place, lang);
  const categoryId = (place.data as any).categoryId ?? (place.data as any).category?.id ?? '';
  const category = categoryId ? categoryMap.get(categoryId) : undefined;
  const details = (place.data as any).details ?? (place.data as any).detailsAccommodation ?? {};

  return {
    entry: place,
    accommodation: {
      id: place.id,
      name: translation?.name ?? (place.data as any).name ?? place.id,
      summary: translation?.description ?? (place.data as any).summary ?? '',
      main_image_url: (place.data as any).mainImageUrl ?? (place.data as any).main_image_url ?? null,
      seo_slug: translation?.seoSlug ?? (place.data as any).seoSlug ?? place.id,
      price_per_night: (details?.pricePerNight ?? details?.price_per_night) ?? null,
      capacity: details?.capacity ?? null,
      category_id: categoryId,
      category_name: category?.name ?? (place.data as any).category_name ?? '',
      category_seo_slug: category?.slug ?? (place.data as any).category_seo_slug ?? '',
    },
  };
};

export const loadPlaceCollections = async (entityConfig: EntityConfig, lang: string): Promise<PlaceCollections> => {
  const normalizedLang = normalizeLang(lang);
  const categories = await getCollection('categories');

  const rootEntry = categories.find((category) => category.id === entityConfig.rootCategoryId) ?? null;
  const childEntries = categories.filter((category) => category.data.parentId === entityConfig.rootCategoryId);
  const categoryMap = buildCategoryMap(childEntries, normalizedLang);

  const places = await getCollection('places', ({ data }) => data.categoryId && categoryMap.has(data.categoryId));

  const summariesByCategory = new Map<string, AccommodationSummary[]>();
  const counts = new Map<string, number>();
  const featured: AccommodationSummary[] = [];

  for (const place of places) {
    const summary = buildAccommodationSummary(place, normalizedLang, categoryMap);
    const categoryId = summary.accommodation.category_id;
    if (!categoryId) continue;

    const list = summariesByCategory.get(categoryId) ?? [];
    list.push(summary);
    summariesByCategory.set(categoryId, list);

    counts.set(categoryId, (counts.get(categoryId) ?? 0) + 1);

    if ((place.data as any).isFeatured) {
      featured.push(summary);
    }
  }

  const flattened = Array.from(summariesByCategory.values()).flat();

  const sortByCreatedAt = (a: AccommodationSummary, b: AccommodationSummary) => {
    const createdA = (a.entry.data as any).createdAt ?? (a.entry.data as any).created_at ?? null;
    const createdB = (b.entry.data as any).createdAt ?? (b.entry.data as any).created_at ?? null;
    const dateA = createdA ? new Date(createdA).getTime() : 0;
    const dateB = createdB ? new Date(createdB).getTime() : 0;
    return dateB - dateA;
  };

  const sortByPriceDesc = (a: AccommodationSummary, b: AccommodationSummary) => {
    const priceA = a.accommodation.price_per_night ?? 0;
    const priceB = b.accommodation.price_per_night ?? 0;
    return priceB - priceA;
  };

  featured.sort(sortByCreatedAt);
  const recent = [...flattened].sort(sortByCreatedAt);
  const popular = [...flattened].sort(sortByPriceDesc);

  return {
    rootCategory: rootEntry ? toLocalizedCategory(rootEntry, normalizedLang) : null,
    childCategories: childEntries.map((entry) => toLocalizedCategory(entry, normalizedLang)),
    categoryCounts: counts,
    placesByCategory: summariesByCategory,
    featured: featured.slice(0, 4),
    recent: recent.slice(0, 6),
    popular: popular.slice(0, 5),
    categoryMap,
  };
};

export const loadPlacesForCategory = async (
  entityConfig: EntityConfig,
  categoryId: string,
  lang: string,
) => {
  const collections = await loadPlaceCollections(entityConfig, lang);
  return {
    ...collections,
    currentCategory: collections.childCategories.find((category) => category.id === categoryId) ?? null,
    places: collections.placesByCategory.get(categoryId) ?? [],
    popular: (collections.placesByCategory.get(categoryId) ?? [])
      .slice()
      .sort((a, b) => (b.accommodation.price_per_night ?? 0) - (a.accommodation.price_per_night ?? 0))
      .slice(0, 5),
  };
};

const coerceAmenities = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object' && 'label' in item) {
          return String((item as Record<string, unknown>).label ?? '');
        }
        return typeof item === 'number' ? item.toString() : '';
      })
      .filter(Boolean);
  }
  if (typeof value === 'object') {
    return Object.values(value as Record<string, unknown>)
      .map((item) => (typeof item === 'string' ? item : typeof item === 'number' ? item.toString() : ''))
      .filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const formatTimeValue = (value: unknown): string | null => {
  if (!value) return null;
  const asDate = value instanceof Date ? value : new Date(value as string);
  if (Number.isNaN(asDate.getTime())) {
    return typeof value === 'string' ? value : null;
  }
  return asDate.toISOString();
};

export const loadPlaceDetail = async (
  entityConfig: EntityConfig,
  place: PlaceEntry,
  lang: string,
  translationOverride?: PlaceTranslation | null,
): Promise<PlaceDetailResult> => {
  const normalizedLang = normalizeLang(lang);
  const collections = await loadPlaceCollections(entityConfig, normalizedLang);

  const translation = translationOverride ?? pickPlaceTranslation(place, normalizedLang);
  const categoryId = (place.data as any).categoryId ?? (place.data as any).category?.id ?? '';
  const category = categoryId ? collections.categoryMap.get(categoryId) ?? null : null;
  const details = (place.data as any).details ?? (place.data as any).detailsAccommodation ?? {};

  const detail: PlaceDetail = {
    place,
    translation,
    category,
    title: translation?.name ?? (place.data as any).name ?? place.id,
    summary: translation?.description ?? (place.data as any).summary ?? '',
    imageUrl: (place.data as any).mainImageUrl ?? (place.data as any).main_image_url ?? null,
    seoSlug: translation?.seoSlug ?? (place.data as any).seoSlug ?? place.id,
    pricePerNight: details?.pricePerNight ?? details?.price_per_night ?? null,
    capacity: details?.capacity ?? null,
    amenities: coerceAmenities(details?.amenities ?? (place.data as any).amenities),
    checkInTime: formatTimeValue(details?.checkInTime ?? details?.check_in_time ?? null),
    checkOutTime: formatTimeValue(details?.checkOutTime ?? details?.check_out_time ?? null),
  };

  const sameCategorySummaries = categoryId
    ? (collections.placesByCategory.get(categoryId) ?? [])
    : [];

  const siblings = sameCategorySummaries
    .filter((summary) => summary.accommodation.id !== place.id)
    .slice(0, 4);

  const popular = sameCategorySummaries
    .slice()
    .sort((a, b) => (b.accommodation.price_per_night ?? 0) - (a.accommodation.price_per_night ?? 0))
    .filter((summary) => summary.accommodation.id !== place.id)
    .slice(0, 5);

  const related = collections.recent
    .filter((summary) => summary.accommodation.id !== place.id)
    .slice(0, 4);

  return {
    detail,
    rootCategory: collections.rootCategory,
    childCategories: collections.childCategories,
    siblings,
    popular,
    related,
  };
};

export const loadPlaceCategorySummaries = async (parentCategoryId: string, lang: string) => {
  const normalizedLang = normalizeLang(lang);
  const categories = await getCollection('categories');
  const childEntries = categories.filter((category) => category.data.parentId === parentCategoryId);
  const categoryMap = buildCategoryMap(childEntries, normalizedLang);
  const places = await getCollection('places', ({ data }) => data.categoryId && categoryMap.has(data.categoryId));

  const counts = new Map<string, number>();
  for (const place of places) {
    const categoryId = (place.data as any).categoryId;
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
