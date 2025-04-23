import prisma from "../../lib/prisma.js";

// ? Get all users (Admin only) with pagination
export const getAllUsersAdmin = async (req, res) => {
  try {
    if (req.userRole !== "ADMIN") {
      return res.status(403).json({ message: "Access denied: Admins only." });
    }

    // Pagination params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Fetch paginated users
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          avatar: true,
          createdAt: true,
          _count: {
            select: { posts: true },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.user.count(),
    ]);

    res.status(200).json({
      data: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Failed to fetch users:", err);
    res.status(500).json({ message: "Failed to retrieve users." });
  }
};
