import prisma from "../../lib/prisma.js";

// ? Get all posts with optional filters (Admin)
export const getAllPostsAdmin = async (req, res) => {
    try {
      if (req.userRole !== "ADMIN") {
        return res.status(403).json({ message: "Access denied: Admins only." });
      }
  
      const {
        status,
        city,
        type,
        property,
        from,
        to,
        page = 1,
        limit = 10,
      } = req.query;
  
      const filters = {};
  
      if (status) filters.status = status;
      if (city) filters.city = city;
      if (type) filters.type = type;
      if (property) filters.property = property;
  
      if (from || to) {
        filters.createdAt = {};
        if (from) filters.createdAt.gte = new Date(from);
        if (to) filters.createdAt.lte = new Date(to);
      }
  
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);
  
      const [posts, total] = await Promise.all([
        prisma.post.findMany({
          where: filters,
          include: {
            user: {
              select: { id: true, username: true, email: true },
            },
            postDetail: true,
          },
          orderBy: { createdAt: "desc" },
          skip,
          take,
        }),
        prisma.post.count({ where: filters }),
      ]);
  
      res.status(200).json({
        data: posts,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      });
    } catch (err) {
      console.error("Failed to fetch admin posts:", err);
      res.status(500).json({ message: "Failed to retrieve posts." });
    }
  };
  