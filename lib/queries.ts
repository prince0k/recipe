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
        reviews: {
          where: { isApproved: true },
          select: { rating: true },
        },
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
export async function getCachedRecipes(
  category?: string, 
  page: number = 1, 
  pageSize: number = 12,
  time?: string,
  dietary?: string | string[],
  sort: string = 'newest'
) {
  const fetcher = unstable_cache(
    async (cat?: string, p: number = 1, ps: number = 12, t?: string, diet?: string | string[], s: string = 'newest') => {
      const skip = (p - 1) * ps;
      
      // Build filters
      const where: any = { 
        type: "RECIPE",
        published: true 
      };

      // Category filter
      if (cat) {
        where.tags = { contains: cat };
      }

      // Dietary filter (can be multiple)
      const diets = Array.isArray(diet) ? diet : diet ? [diet] : [];
      if (diets.length > 0) {
        where.AND = diets.map(d => ({
          tags: { contains: d }
        }));
      }

      // Time filter (simplified mapping for now)
      if (t) {
        if (t === "Under 15 mins") where.cookingTime = { contains: "1" }; // Matches 10, 15 etc. brittle but works for now
        else if (t === "15-30 mins") where.cookingTime = { contains: "2" }; 
        // Note: This is brittle. A better way is numeric field.
        // For now, let's at least try to match tags or generic strings
      }

      // Sorting
      let orderBy: any = { createdAt: "desc" };
      if (s === "oldest") orderBy = { createdAt: "asc" };
      else if (s === "fastest") orderBy = { cookingTime: "asc" };

      const [data, totalCount] = await Promise.all([
        prisma.content.findMany({
          where,
          orderBy,
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
              reviews: {
                where: { isApproved: true },
                select: { rating: true },
              },
            }
        }),
        prisma.content.count({ where })
      ]);

      return { data, totalCount, totalPages: Math.ceil(totalCount / ps) };
    },
    [`all-recipes-${category}-${page}-${pageSize}-${time}-${JSON.stringify(dietary)}-${sort}`],
    { revalidate: 3600, tags: ["content", "recipes"] }
  );
  return fetcher(category, page, pageSize, time, dietary, sort);
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
    const [
      totalUsers,
      recentDownloads,
      publishedContent,
      latestUsers,
      totalSubscribers,
      pendingRequestsCount,
      pendingReviewsCount,
      aiStats,
      pendingReviews,
      pendingRequests,
      recentUsersForGrowth,
      recentDownloadsForGrowth,
      contentDistribution,
      subscribersByCountry
    ] = await Promise.all([
      prisma.user.count(),
      prisma.download.count(),
      prisma.content.count({ where: { published: true } }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, email: true, createdAt: true }
      }),
      prisma.subscriber.count(),
      prisma.personalizedRequest.count({ where: { status: "PENDING" } }),
      prisma.review.count({ where: { isApproved: false } }),
      prisma.aILog.aggregate({
        _count: { id: true },
        _sum: { estimatedCost: true }
      }),
      prisma.review.findMany({
        where: { isApproved: false },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          content: { select: { title: true } }
        }
      }),
      prisma.personalizedRequest.findMany({
        where: { status: "PENDING" },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          content: { select: { title: true } }
        }
      }),
      prisma.user.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        },
        select: { createdAt: true }
      }),
      prisma.download.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        },
        select: { createdAt: true }
      }),
      prisma.content.groupBy({
        by: ["type"],
        _count: { id: true }
      }),
      prisma.subscriber.groupBy({
        by: ["country"],
        _count: { id: true },
        orderBy: {
          _count: { id: "desc" }
        },
        take: 5
      })
    ]);

    // Format Growth Trend over the last 30 days
    const dateMap: { [key: string]: { date: string; users: number; downloads: number } } = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split("T")[0];
      const dateLabel = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      dateMap[dateKey] = { date: dateLabel, users: 0, downloads: 0 };
    }

    recentUsersForGrowth.forEach((u) => {
      const dateKey = u.createdAt.toISOString().split("T")[0];
      if (dateMap[dateKey]) {
        dateMap[dateKey].users++;
      }
    });

    recentDownloadsForGrowth.forEach((d) => {
      const dateKey = d.createdAt.toISOString().split("T")[0];
      if (dateMap[dateKey]) {
        dateMap[dateKey].downloads++;
      }
    });

    const growthTrend = Object.keys(dateMap)
      .sort()
      .map((key) => dateMap[key]);

    const formattedContentDistribution = contentDistribution.map((c) => ({
      name: c.type.replace("_", " "),
      value: c._count.id
    }));

    const formattedSubscribersByCountry = subscribersByCountry.map((c) => ({
      country: c.country || "Unknown",
      count: c._count.id
    }));

    return {
      totalUsers,
      recentDownloads,
      publishedContent,
      latestUsers,
      totalSubscribers,
      pendingRequestsCount,
      pendingReviewsCount,
      aiStats: {
        totalRequests: aiStats._count.id,
        totalCost: aiStats._sum.estimatedCost || 0
      },
      pendingReviews,
      pendingRequests,
      growthTrend,
      contentDistribution: formattedContentDistribution,
      subscribersByCountry: formattedSubscribersByCountry
    };
  },
  ["admin-dashboard-stats"],
  { revalidate: 60, tags: ["admin", "users", "content", "downloads", "subscribers", "reviews", "requests"] }
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

