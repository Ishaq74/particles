// src/middleware.ts

import { defineMiddleware } from 'astro:middleware';
import type { MiddlewareHandler } from 'astro';
import {
  findRootCategoryBySlug,
  findChildCategoryBySlug,
  findArticleBySlug,
  findPlaceBySlug,
  getCategoryDefaultSlug,
  getCategoryById,
} from '@utils/contentLookup';
import {
  getEntityConfigByRootCategoryId,
  findEntityConfigByLegacySlug,
} from '@lib/entityRegistry';



const SUPPORTED_LANGS = ['fr', 'en', 'es'] as const;
type LangCode = typeof SUPPORTED_LANGS[number];

const isSupportedLangCode = (value: unknown): value is LangCode =>
  typeof value === 'string' && SUPPORTED_LANGS.includes(value as LangCode);

export const onRequest: MiddlewareHandler = async (context, next) => {
  const { url, locals, params } = context;
  const lang: LangCode = isSupportedLangCode(params.lang) ? params.lang : 'fr';
  locals.lang = lang;

  // Langues disponibles
  const availableLangs = [
    { code: 'fr', name: 'Français', flag: 'fr' },
    { code: 'en', name: 'English', flag: 'gb' },
    { code: 'es', name: 'Español', flag: 'es' }
  ];

  // Utilisateur connecté (à remplacer par ta vraie logique d’auth)
  const isUserLoggedIn = true;
  const userName = 'Jean Dupont';
  const userEmail = 'jean.dupont@email.com';
  const userAvatarSrc = 'https://ui-avatars.com/api/?name=Jean+Dupont';

  // Ajoute tout dans Astro.locals
  locals.availableLangs = availableLangs;
  locals.isUserLoggedIn = isUserLoggedIn;
  locals.userName = userName;
  locals.userEmail = userEmail;
  locals.userAvatarSrc = userAvatarSrc;

  const pathSegments = url.pathname.split('/').filter(Boolean);

  // Format attendu: /:lang/:entity/:category?/:item?
  const entitySlug = pathSegments[1] ?? '';
  const categorySlug = pathSegments[2] ?? '';
  const itemSlug = pathSegments[3] ?? '';

  let entityEntry = null;
  let entityConfig = undefined;
  let resolvedEntitySlug = entitySlug;

  if (entitySlug) {
    entityEntry = await findRootCategoryBySlug(lang, entitySlug);
    if (entityEntry) {
      entityConfig = getEntityConfigByRootCategoryId(entityEntry.id) ?? getEntityConfigByRootCategoryId((entityEntry.data as any)?.id);
    }

    if (!entityConfig) {
      const legacyConfig = findEntityConfigByLegacySlug(entitySlug);
      if (legacyConfig) {
        entityConfig = legacyConfig;
        resolvedEntitySlug = legacyConfig.defaultSlug;
        entityEntry = await findRootCategoryBySlug(lang, legacyConfig.defaultSlug)
          ?? await findRootCategoryBySlug('fr', legacyConfig.defaultSlug)
          ?? await getCategoryById(legacyConfig.rootCategoryId);
      }
    }
  }

  if (!entityEntry && entitySlug) {
    const fallbackConfig = findEntityConfigByLegacySlug(entitySlug);
    if (fallbackConfig) {
      entityConfig = fallbackConfig;
      resolvedEntitySlug = fallbackConfig.defaultSlug;
      entityEntry = await getCategoryById(fallbackConfig.rootCategoryId);
    }
  }

  if (!entityConfig && entityEntry) {
    entityConfig = getEntityConfigByRootCategoryId(entityEntry.id) ?? getEntityConfigByRootCategoryId((entityEntry.data as any)?.id);
  }

  if (!entityEntry && entityConfig) {
    entityEntry = await getCategoryById(entityConfig.rootCategoryId);
  }

  let categoryEntry = entityEntry;
  let resolvedCategorySlug = categorySlug;

  if (entityEntry && categorySlug) {
    categoryEntry = await findChildCategoryBySlug(entityEntry.id, lang, categorySlug)
      ?? await findChildCategoryBySlug(entityEntry.id, 'fr', categorySlug);
  }

  if (categoryEntry) {
    resolvedEntitySlug = getCategoryDefaultSlug(entityEntry ?? categoryEntry, lang) ?? (entityConfig?.defaultSlug ?? resolvedEntitySlug);
    resolvedCategorySlug = categorySlug || getCategoryDefaultSlug(categoryEntry, lang);
  }

  let itemEntry: Record<string, unknown> | null = null;
  let itemTranslation: Record<string, unknown> | null = null;

  if (entityConfig && categoryEntry && itemSlug) {
    if (entityConfig.collection === 'articles') {
      const articleMatch = await findArticleBySlug(categoryEntry.id, lang, itemSlug)
        ?? await findArticleBySlug(categoryEntry.id, 'fr', itemSlug);

      if (articleMatch) {
        itemEntry = articleMatch.article;
        itemTranslation = articleMatch.translation as unknown as Record<string, unknown> | null;
      }
    }

    if (!itemEntry && entityConfig.collection === 'places') {
      const placeMatch = await findPlaceBySlug(categoryEntry.id, lang, itemSlug)
        ?? await findPlaceBySlug(categoryEntry.id, 'fr', itemSlug);

      if (placeMatch) {
        itemEntry = placeMatch.place as unknown as Record<string, unknown>;
        itemTranslation = placeMatch.translation as unknown as Record<string, unknown> | null;
      }
    }
  }

  if (entityConfig && entityEntry) {
    locals.pageContext = {
      type: entityConfig.type,
      entityId: entityEntry.id,
      slug: resolvedEntitySlug || entityConfig.defaultSlug,
      lang,
      categoryId: categoryEntry?.id,
      entity: entityEntry,
      category: categoryEntry,
      categorySlug: resolvedCategorySlug,
      item: itemEntry,
      itemTranslation,
      itemSlug,
      entityConfig,
    };
  } else {
    locals.pageContext = undefined;
  }

  return next();
};




