export type EntityKey = 'magazine' | 'hebergements';

export type EntityCollection = 'articles' | 'places';

export interface EntityConfig {
  key: EntityKey;
  type: EntityKey;
  rootCategoryId: string;
  defaultSlug: string;
  collection: EntityCollection;
  legacySlugs?: string[];
}

const registry: Record<EntityKey, EntityConfig> = {
  magazine: {
    key: 'magazine',
    type: 'magazine',
    rootCategoryId: 'd20b7566-105a-47f3-947f-dab773bef43e',
    defaultSlug: 'magazine',
    collection: 'articles',
    legacySlugs: ['magazine', 'revista', 'magazin'],
  },
  hebergements: {
    key: 'hebergements',
    type: 'hebergements',
    rootCategoryId: 'ad66f5d9-5f9f-4e2d-8d1f-6d2e5d5f6f5f',
    defaultSlug: 'hebergements',
    collection: 'places',
    legacySlugs: ['hebergements', 'lodging', 'accommodations', 'alojamientos'],
  },
};

const rootCategoryToConfig = new Map<string, EntityConfig>(
  Object.values(registry).map((config) => [config.rootCategoryId, config]),
);

export const entityRegistry = registry;

export const entityConfigs = Object.values(registry);

export function getEntityConfigByKey(key: EntityKey) {
  return registry[key];
}

export function getEntityConfigByRootCategoryId(categoryId: string | undefined | null) {
  if (!categoryId) return undefined;
  return rootCategoryToConfig.get(categoryId) ?? undefined;
}

export function findEntityConfigByLegacySlug(slug: string | undefined | null) {
  if (!slug) return undefined;
  const normalized = slug.trim().toLowerCase();
  return entityConfigs.find((config) => config.legacySlugs?.some((candidate) => candidate.toLowerCase() === normalized));
}