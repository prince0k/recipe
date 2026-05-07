import { prisma } from "./db";
import { unstable_cache } from "next/cache";

/**
 * CACHE KEY STRATEGY:
 * - content-list: All content items
 * - featured-recipes: The 3 latest featured recipes
 * - subscriber-stats: Aggregated counts for the admin dashboard
 */

export const getFeaturedRecipes = unstable_cache(
  async () => {
    return prisma.content.findMany({
      where: { 
        type: "RECIPE",
        published: true 
      },
      take: 3,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        coverImage: true,
        cookingTime: true,
        difficulty: true,
        tags: true,
      }
    });
  },
  ["featured-recipes"],
  { revalidate: 3600, tags: ["content", "recipes"] }
);

export const getAllRecipes = unstable_cache(
  async (category?: string, page: number = 1, pageSize: number = 12) => {
    const skip = (page - 1) * pageSize;
    
    const [data, totalCount] = await Promise.all([
      prisma.content.findMany({
        where: { 
          type: "RECIPE",
          published: true,
          ...(category ? { tags: { contains: category } } : {}),
        },
        orderBy: { createdAt: "desc" },
        take: pageSize,
        skip: skip,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          coverImage: true,
          tags: true,
          cookingTime: true,
          difficulty: true,
          type: true,
        }
      }),
      prisma.content.count({
        where: { 
          type: "RECIPE",
          published: true,
          ...(category ? { tags: { contains: category } } : {}),
        }
      })
    ]);

    return {
      data,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize)
    };
  },
  ["all-recipes"],
  { revalidate: 3600, tags: ["content", "recipes"] }
);

// Updated function with dynamic key
export async function getCachedRecipes(category?: string, page: number = 1, pageSize: number = 12) {
  const fetcher = unstable_cache(
    async (cat?: string, p: number = 1, ps: number = 12) => {
      const skip = (p - 1) * ps;
      const [data, totalCount] = await Promise.all([
        prisma.content.findMany({
          where: { 
            type: "RECIPE",
            published: true,
            ...(cat ? { tags: { contains: cat } } : {}),
          },
          orderBy: { createdAt: "desc" },
          take: ps,
          skip: skip,
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            coverImage: true,
            tags: true,
            cookingTime: true,
            difficulty: true,
            type: true,
          }
        }),
        prisma.content.count({
          where: { 
            type: "RECIPE",
            published: true,
            ...(cat ? { tags: { contains: cat } } : {}),
          }
        })
      ]);

      return { data, totalCount, totalPages: Math.ceil(totalCount / ps) };
    },
    [`all-recipes-${category}-${page}-${pageSize}`],
    { revalidate: 3600, tags: ["content", "recipes"] }
  );
  return fetcher(category, page, pageSize);
}

export const getSubscriberStats = unstable_cache(
  async () => {
    const [total, today] = await Promise.all([
      prisma.subscriber.count(),
      prisma.subscriber.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    const topCountries = await prisma.subscriber.groupBy({
      by: ['country'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 5,
    });

    return {
      total,
      today,
      topCountries: topCountries.map((c: any) => ({
        country: c.country || 'Unknown',
        count: c._count.id
      }))
    };
  },
  ["subscriber-stats"],
  { revalidate: 60, tags: ["subscribers"] }
);

export const getAdminDashboardStats = unstable_cache(
  async () => {
    const [totalUsers, recentDownloads, publishedContent, latestUsers] = await Promise.all([
      prisma.user.count(),
      prisma.download.count(),
      prisma.content.count({ where: { published: true } }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, email: true, createdAt: true }
      })
    ]);

    return { totalUsers, recentDownloads, publishedContent, latestUsers };
  },
  ["admin-dashboard-stats"],
  { revalidate: 60, tags: ["admin", "users", "content", "downloads"] }
);

export const getAllBlogPosts = unstable_cache(
  async (page: number = 1, pageSize: number = 9) => {
    const skip = (page - 1) * pageSize;

    const [data, totalCount] = await Promise.all([
      prisma.content.findMany({
        where: { type: "BLOG", published: true },
        orderBy: { createdAt: "desc" },
        take: pageSize,
        skip: skip,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          coverImage: true,
          tags: true,
          type: true,
        }
      }),
      prisma.content.count({
        where: { type: "BLOG", published: true }
      })
    ]);

    return {
      data,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize)
    };
  },
  ["all-blog-posts"],
  { revalidate: 3600, tags: ["content", "blog"] }
);

export async function getCachedBlogPosts(page: number = 1, pageSize: number = 9) {
  const fetcher = unstable_cache(
    async (p: number = 1, ps: number = 9) => {
      const skip = (p - 1) * ps;
      const [data, totalCount] = await Promise.all([
        prisma.content.findMany({
          where: { type: "BLOG", published: true },
          orderBy: { createdAt: "desc" },
          take: ps,
          skip: skip,
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            coverImage: true,
            tags: true,
            type: true,
          }
        }),
        prisma.content.count({
          where: { type: "BLOG", published: true }
        })
      ]);
      return { data, totalCount, totalPages: Math.ceil(totalCount / ps) };
    },
    [`all-blog-posts-${page}-${pageSize}`],
    { revalidate: 3600, tags: ["content", "blog"] }
  );
  return fetcher(page, pageSize);
}

export const getAllCheatSheets = unstable_cache(
  async (page: number = 1, pageSize: number = 9) => {
    const skip = (page - 1) * pageSize;

    const [data, totalCount] = await Promise.all([
      prisma.content.findMany({
        where: { type: "CHEAT_SHEET", published: true },
        orderBy: { createdAt: "desc" },
        take: pageSize,
        skip: skip,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          coverImage: true,
          tags: true,
          type: true,
        }
      }),
      prisma.content.count({
        where: { type: "CHEAT_SHEET", published: true }
      })
    ]);

    return {
      data,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize)
    };
  },
  ["all-cheat-sheets"],
  { revalidate: 3600, tags: ["content", "cheat-sheets"] }
);

export async function getCachedCheatSheets(page: number = 1, pageSize: number = 9) {
  const fetcher = unstable_cache(
    async (p: number = 1, ps: number = 9) => {
      const skip = (p - 1) * ps;
      const [data, totalCount] = await Promise.all([
        prisma.content.findMany({
          where: { type: "CHEAT_SHEET", published: true },
          orderBy: { createdAt: "desc" },
          take: ps,
          skip: skip,
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            coverImage: true,
            tags: true,
            type: true,
          }
        }),
        prisma.content.count({
          where: { type: "CHEAT_SHEET", published: true }
        })
      ]);
      return { data, totalCount, totalPages: Math.ceil(totalCount / ps) };
    },
    [`all-cheat-sheets-${page}-${pageSize}`],
    { revalidate: 3600, tags: ["content", "cheat-sheets"] }
  );
  return fetcher(page, pageSize);
}

export const getAllDietPlans = unstable_cache(
  async () => {
    return prisma.content.findMany({
      where: { type: "DIET_PLAN", published: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        tags: true,
        type: true,
      }
    });
  },
  ["all-diet-plans"],
  { revalidate: 3600, tags: ["content", "diet-plans"] }
);

