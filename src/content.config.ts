import { defineCollection } from "astro:content";
import prisma from "./lib/prisma";

type PrismaLoaderConfig = {
  model: string;
  where?: Record<string, unknown>;
  orderBy?: Record<string, unknown>;
  limit?: number;
  include?: Record<string, unknown>;
  map?: (item: any) => Record<string, unknown>;
  resolveId?: (item: any) => string | number | undefined;
};

// Loader générique compatible avec l'API Content Layer Astro
function prismaLoader({ model, where = {}, orderBy, limit, include, map, resolveId }: PrismaLoaderConfig) {
  return {
    name: `prisma-${model}`,
    async load(context: any) {
      const accessCandidates = [model, model.charAt(0).toUpperCase() + model.slice(1)];
      const modelClient = accessCandidates
        .map((key) => (prisma as Record<string, any>)[key])
        .find((candidate) => candidate && typeof candidate.findMany === 'function');
      if (!modelClient || typeof modelClient.findMany !== 'function') {
        console.warn(`[content.config] prisma model not found: ${model}. Skipping loader "prisma-${model}".`);
        return;
      }

      const results = await modelClient.findMany({
        where,
        orderBy,
        take: limit,
        include,
      });

      for (const item of results) {
        const idValue = resolveId ? resolveId(item) : item.id ?? item.slug ?? item.seoSlug;
        if (!idValue) {
          console.warn(`[content.config] entry missing id for model ${model}`, item);
          continue;
        }

        const entryData = map ? map(item) : { ...item, _model: model };

        context.store.set({
          id: idValue.toString(),
          data: entryData,
        });
      }
    },
  };
}

// Mapping helpers pour garantir une structure homogène dans Astro Content
const mapCategoryEntry = (item: any) => ({
  ...item,
  _model: 'category',
});

const mapArticleTranslationEntry = (item: any) => ({
  ...item,
  _model: 'articleTranslation',
});

const mapArticleEntry = (item: any) => {
  const data = {
    ...item,
    _model: 'article',
  } as Record<string, unknown>;

  if (item.authorId) {
    data.author = { collection: 'authors', id: item.authorId.toString() };
  }

  if (item.categoryId) {
    data.category = { collection: 'categories', id: item.categoryId.toString() };
  }

  if (Array.isArray(item.translations)) {
    data.translations = item.translations.map((translation: any) => ({
      collection: 'articleTranslation',
      id: translation.id.toString(),
    }));
  }

  if (Array.isArray(item.relatedArticles)) {
    data.relatedArticles = item.relatedArticles
      .filter((relation: any) => relation?.relatedArticleId)
      .map((relation: any) => ({
        collection: 'articles',
        id: relation.relatedArticleId.toString(),
      }));
  }

  if (Array.isArray(item.relatedTo)) {
    data.relatedTo = item.relatedTo
      .filter((relation: any) => relation?.articleId)
      .map((relation: any) => ({
        collection: 'articles',
        id: relation.articleId.toString(),
      }));
  }

  return data;
};

const mapAuthorEntry = (item: any) => ({
  ...item,
  _model: 'author',
});

const mapPlaceEntry = (item: any) => {
  const data = {
    ...item,
    _model: 'place',
  } as Record<string, unknown>;

  if (item.categoryId) {
    data.category = { collection: 'categories', id: item.categoryId.toString() };
  }

  if (Array.isArray(item.translations)) {
    data.translations = item.translations;
  }

  if (item.details) {
    data.details = item.details;
  }

  return data;
};

// collections dynamiques Prisma (utilisent les modèles réels du schema.prisma)
const categories = defineCollection({
  loader: prismaLoader({
    model: "category",
    orderBy: { displayOrder: "asc" },
    include: { translations: true },
    map: mapCategoryEntry,
  }),
});

const articleTranslation = defineCollection({
  loader: prismaLoader({
    model: "articleTranslation",
    orderBy: { createdAt: "desc" },
    map: mapArticleTranslationEntry,
  }),
});

const articles = defineCollection({
  loader: prismaLoader({
    model: "article",
    orderBy: { publicationDate: "desc" },
    include: { author: true, translations: true, relatedArticles: true, relatedTo: true },
    map: mapArticleEntry,
  }),
});

const authors = defineCollection({
  loader: prismaLoader({
    model: "author",
    map: mapAuthorEntry,
  }),
});

const places = defineCollection({
  loader: prismaLoader({
    model: "place",
    include: { translations: true, details: true },
    map: mapPlaceEntry,
  }),
});

// navigation générée dynamiquement
const headerNavigation = defineCollection({
  loader: {
    name: "header-navigation",
    async load(context: any) {
      // Build header navigation from top-level categories
      const topCats = await prisma.category.findMany({
        where: { parentId: null, isActive: true },
        include: { translations: true, children: { include: { translations: true } } },
        orderBy: { displayOrder: 'asc' },
      });

      for (const cat of topCats) {
        context.store.set({
          id: cat.id.toString(),
          data: {
            title: cat.translations?.[0]?.name ?? cat.slug,
            slug: cat.slug,
            _children: (cat.children || []).map((c: any) => ({
              title: c.translations?.[0]?.name ?? c.slug,
              slug: c.slug,
            })),
          },
        });
      }
    },
  },
});

// export final
export const collections = {
  categories,
  articles,
  articleTranslation,
  authors,
  places,
  headerNavigation,
};
