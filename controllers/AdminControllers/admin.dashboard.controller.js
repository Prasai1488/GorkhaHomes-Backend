import prisma from "../../lib/prisma.js";
import { startOfMonth, subDays } from "date-fns";

export const getAdminDashboardStats = async (req, res) => {
  try {
    if (req.userRole !== "ADMIN") {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }

    const now = new Date();
    const startMonth = startOfMonth(now);
    const sevenDaysAgo = subDays(now, 7);

    // ✅ MongoDB aggregation for top cities
    const rawResult = await prisma.$runCommandRaw({
      aggregate: "Post",
      pipeline: [
        { $match: { city: { $ne: null } } }, // Optional: exclude null city
        { $group: { _id: "$city", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ],
      cursor: {},
    });

    const topCities = rawResult?.cursor?.firstBatch || [];

    // ✅ Other stats
    const [
      totalUsers,
      activeUsers,
      totalPosts,
      approvedPosts,
      pendingPosts,
      rejectedPosts,
      postsThisMonth,
      newUsersThisWeek,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { active: true } }),
      prisma.post.count(),
      prisma.post.count({ where: { status: "APPROVED" } }),
      prisma.post.count({ where: { status: "PENDING" } }),
      prisma.post.count({ where: { status: "REJECTED" } }),
      prisma.post.count({
        where: {
          createdAt: { gte: startMonth, lte: now },
        },
      }),
      prisma.user.count({
        where: {
          createdAt: { gte: sevenDaysAgo, lte: now },
        },
      }),
    ]);

    // ✅ Final response
    res.status(200).json({
      totalUsers,
      activeUsers,
      newUsersThisWeek,
      totalPosts,
      approvedPosts,
      pendingPosts,
      rejectedPosts,
      postsThisMonth,
      popularCities: topCities.map((c) => ({
        city: c._id,
        count: c.count,
      })),
    });
  } catch (err) {
    console.error("Failed to fetch admin stats:", err);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
};
