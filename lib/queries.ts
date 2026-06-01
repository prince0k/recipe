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
        excerpt: true,
        createdAt: true,
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


function getTimeFilter(timeLabel: string): any {
  if (timeLabel === "Under 15 mins") {
    return {
      OR: [
        { cookingTime: { equals: "0 mins" } },
        { cookingTime: { startsWith: "1 mins" } },
        { cookingTime: { startsWith: "2 mins" } },
        { cookingTime: { startsWith: "3 mins" } },
        { cookingTime: { startsWith: "4 mins" } },
        { cookingTime: { startsWith: "5 mins" } },
        { cookingTime: { startsWith: "6 mins" } },
        { cookingTime: { startsWith: "7 mins" } },
        { cookingTime: { startsWith: "8 mins" } },
        { cookingTime: { startsWith: "9 mins" } },
        { cookingTime: { startsWith: "10 mins" } },
        { cookingTime: { startsWith: "11 mins" } },
        { cookingTime: { startsWith: "12 mins" } },
        { cookingTime: { startsWith: "13 mins" } },
        { cookingTime: { startsWith: "14 mins" } },
        { cookingTime: { startsWith: "15 mins" } },
        { cookingTime: { startsWith: "5 min" } },
        { cookingTime: { startsWith: "10 min" } },
        { cookingTime: { startsWith: "12 min" } },
        { cookingTime: { startsWith: "15 min" } }
      ]
    };
  }
  
  if (timeLabel === "15-30 mins") {
    return {
      OR: [
        { cookingTime: null }, // default fallback to match database nulls
        { cookingTime: { startsWith: "15 mins" } },
        { cookingTime: { startsWith: "16 mins" } },
        { cookingTime: { startsWith: "17 mins" } },
        { cookingTime: { startsWith: "18 mins" } },
        { cookingTime: { startsWith: "19 mins" } },
        { cookingTime: { startsWith: "20 mins" } },
        { cookingTime: { startsWith: "21 mins" } },
        { cookingTime: { startsWith: "22 mins" } },
        { cookingTime: { startsWith: "23 mins" } },
        { cookingTime: { startsWith: "24 mins" } },
        { cookingTime: { startsWith: "25 mins" } },
        { cookingTime: { startsWith: "26 mins" } },
        { cookingTime: { startsWith: "27 mins" } },
        { cookingTime: { startsWith: "28 mins" } },
        { cookingTime: { startsWith: "29 mins" } },
        { cookingTime: { startsWith: "30 mins" } },
        { cookingTime: { startsWith: "15 min" } },
        { cookingTime: { startsWith: "20 min" } },
        { cookingTime: { startsWith: "25 min" } },
        { cookingTime: { startsWith: "30 min" } }
      ]
    };
  }
  
  if (timeLabel === "30-60 mins") {
    return {
      OR: [
        { cookingTime: { startsWith: "30 mins" } },
        { cookingTime: { startsWith: "35 mins" } },
        { cookingTime: { startsWith: "40 mins" } },
        { cookingTime: { startsWith: "45 mins" } },
        { cookingTime: { startsWith: "50 mins" } },
        { cookingTime: { startsWith: "55 mins" } },
        { cookingTime: { startsWith: "60 mins" } },
        { cookingTime: { startsWith: "30 min" } },
        { cookingTime: { startsWith: "35 min" } },
        { cookingTime: { startsWith: "40 min" } },
        { cookingTime: { startsWith: "45 min" } },
        { cookingTime: { startsWith: "50 min" } },
        { cookingTime: { startsWith: "55 min" } },
        { cookingTime: { startsWith: "60 min" } }
      ]
    };
  }
  
  if (timeLabel === "1 hour+") {
    return {
      OR: [
        { cookingTime: { contains: "hour", mode: "insensitive" } },
        { cookingTime: { contains: "hr", mode: "insensitive" } },
        { cookingTime: { startsWith: "65 mins" } },
        { cookingTime: { startsWith: "70 mins" } },
        { cookingTime: { startsWith: "75 mins" } },
        { cookingTime: { startsWith: "80 mins" } },
        { cookingTime: { startsWith: "90 mins" } },
        { cookingTime: { startsWith: "120 mins" } }
      ]
    };
  }
  
  return {};
}

function getCategoryFilter(category: string): any {
  const catLower = category.toLowerCase();
  
  if (catLower === "quick-recipes" || catLower === "quick recipes") {
    return {
      OR: [
        { tags: { contains: "quick", mode: "insensitive" } },
        { tags: { contains: "easy", mode: "insensitive" } },
        { tags: { contains: "one-pan", mode: "insensitive" } },
        { tags: { contains: "sheet-pan", mode: "insensitive" } },
        { tags: { contains: "breakfast", mode: "insensitive" } },
        { tags: { contains: "meal-prep", mode: "insensitive" } },
        { tags: { contains: "fast", mode: "insensitive" } }
      ]
    };
  }
  
  if (catLower === "healthy-eating" || catLower === "healthy eating") {
    return {
      OR: [
        { tags: { contains: "healthy", mode: "insensitive" } },
        { tags: { contains: "nutrition", mode: "insensitive" } },
        { tags: { contains: "plant-based", mode: "insensitive" } },
        { tags: { contains: "vegan", mode: "insensitive" } },
        { tags: { contains: "vegetarian", mode: "insensitive" } },
        { tags: { contains: "gluten-free", mode: "insensitive" } },
        { tags: { contains: "low-carb", mode: "insensitive" } },
        { tags: { contains: "sugar-free", mode: "insensitive" } },
        { tags: { contains: "fiber", mode: "insensitive" } },
        { tags: { contains: "wellness", mode: "insensitive" } },
        { tags: { contains: "gut-health", mode: "insensitive" } },
        { tags: { contains: "biohacking", mode: "insensitive" } }
      ]
    };
  }
  
  if (catLower === "budget-friendly" || catLower === "budget friendly" || catLower === "budget") {
    return {
      OR: [
        { tags: { contains: "budget", mode: "insensitive" } },
        { tags: { contains: "inflation-proof", mode: "insensitive" } },
        { tags: { contains: "cheap", mode: "insensitive" } },
        { tags: { contains: "pantry", mode: "insensitive" } }
      ]
    };
  }
  
  if (catLower === "dinner-ideas" || catLower === "dinner ideas" || catLower === "dinner") {
    return {
      OR: [
        { tags: { contains: "dinner", mode: "insensitive" } },
        { tags: { contains: "roast", mode: "insensitive" } },
        { tags: { contains: "bowl", mode: "insensitive" } },
        { tags: { contains: "skillet", mode: "insensitive" } },
        { tags: { contains: "main", mode: "insensitive" } },
        { tags: { contains: "lunch", mode: "insensitive" } },
        { tags: { contains: "meal", mode: "insensitive" } }
      ]
    };
  }

  if (catLower === "breakfast") {
    return {
      OR: [
        { tags: { contains: "breakfast", mode: "insensitive" } },
        { tags: { contains: "smoothie", mode: "insensitive" } },
        { tags: { contains: "loaf", mode: "insensitive" } },
        { tags: { contains: "baking", mode: "insensitive" } },
        { tags: { contains: "skillet", mode: "insensitive" } }
      ]
    };
  }

  if (catLower === "lunch") {
    return {
      OR: [
        { tags: { contains: "lunch", mode: "insensitive" } },
        { tags: { contains: "bowl", mode: "insensitive" } },
        { tags: { contains: "skillet", mode: "insensitive" } },
        { tags: { contains: "salad", mode: "insensitive" } },
        { tags: { contains: "soup", mode: "insensitive" } }
      ]
    };
  }
  
  return { tags: { contains: category, mode: "insensitive" } };
}

function getDietaryFilter(diet: string): any {
  const dLower = diet.toLowerCase();
  if (dLower === "gluten free" || dLower === "gluten-free") {
    return {
      OR: [
        { tags: { contains: "gluten free", mode: "insensitive" } },
        { tags: { contains: "gluten-free", mode: "insensitive" } }
      ]
    };
  }
  if (dLower === "dairy free" || dLower === "dairy-free") {
    return {
      OR: [
        { tags: { contains: "dairy free", mode: "insensitive" } },
        { tags: { contains: "dairy-free", mode: "insensitive" } }
      ]
    };
  }
  if (dLower === "vegan") {
    return {
      OR: [
        { tags: { contains: "vegan", mode: "insensitive" } }
      ]
    };
  }
  if (dLower === "vegetarian") {
    return {
      OR: [
        { tags: { contains: "vegetarian", mode: "insensitive" } },
        { tags: { contains: "plant-based", mode: "insensitive" } }
      ]
    };
  }
  return { tags: { contains: diet, mode: "insensitive" } };
}

export const getAllRecipes = unstable_cache(
  async (category?: string, page: number = 1, pageSize: number = 12) => {
    const skip = (page - 1) * pageSize;

    const [data, totalCount] = await Promise.all([
      prisma.content.findMany({
        where: { 
          type: "RECIPE",
          published: true,
          ...(category ? getCategoryFilter(category) : {}),
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
          ...(category ? getCategoryFilter(category) : {}),
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
    async (
      cat?: string,
      p: number = 1,
      ps: number = 12,
      t?: string,
      diet?: string | string[],
      s: string = 'newest'
    ) => {
      const skip = (p - 1) * ps;

      // Build filters
      const where: any = { 
        type: "RECIPE",
        published: true 
      };

      // Category filter
      if (cat) {
        Object.assign(where, getCategoryFilter(cat));
      }

      // Dietary filter (can be multiple)
      const diets = Array.isArray(diet) ? diet : diet ? [diet] : [];
      if (diets.length > 0) {
        where.AND = diets.map(d => getDietaryFilter(d));
      }

      // Time filter
      if (t) {
        Object.assign(where, getTimeFilter(t));
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

