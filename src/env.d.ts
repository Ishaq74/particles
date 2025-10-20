/// <reference path="../.astro/types.d.ts" />

declare namespace App {
    // Note: 'import {} from ""' syntax does not work in .d.ts files.
    interface Locals {
        user: import("better-auth").User | null;
        session: import("better-auth").Session | null;
    }
}

interface ImportMetaEnv {
  readonly DATABASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

/// <reference types="astro/client" />

declare namespace App {
    interface Locals {
        lang: 'fr' | 'en' | 'es';
        site: {
        menuCategories: any[];
        i18nMap: Record<string, any>;
        };
        availableLangs: Array<{ code: string; name: string; flag: string }>;
        isUserLoggedIn: boolean;
        userName: string;
        userEmail: string;
        userAvatarSrc: string;

        // LE CONTEXTE DE LA PAGE ACTUELLE
        pageContext?: {
            type: 'magazine' | 'hebergements' | 'category' | 'slug' | 'article' | 'author';
            entityId: string;
            slug?: string;
            categoryId?: string;
            lang: 'fr' | 'en' | 'es';
            categorySlug?: string;
            itemSlug?: string;
            entity?: Record<string, unknown> | null;
            category?: Record<string, unknown> | null;
            item?: Record<string, unknown> | null;
            itemTranslation?: Record<string, unknown> | null;
            entityConfig?: import('@lib/entityRegistry').EntityConfig;
        };

        magazineIndexData?: {
            featuredArticles: any[];
            recentArticles: any[];
            sidebarCategoriesArticlesWithCount: any[];
            sidebarPopularArticles: any[];
        };

        magazineCategoryData?: {
            category: any;
            articles: any[];
            popularInCategory: any[];
        };

        articlePageData?: {
            article: any;
            relatedArticles: any[];
            sameCategoryArticles: any[];
            comments: any[];
        };

        authorPageData?: {
            author: any;
            articles: any[];
        };
    }
}