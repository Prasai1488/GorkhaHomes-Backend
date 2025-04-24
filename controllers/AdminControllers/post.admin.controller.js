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

// ? admin delete any kind of posts
export const adminDeletePost = async (req, res) => {
  const id = req.params.id;

  try {
    // ✅ Check if requester is admin
    if (req.userRole !== "ADMIN") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // ✅ Fetch the post and its related data
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        postDetail: true,
        savedPosts: true,
      },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // ✅ Delete related saved posts
    if (post.savedPosts.length > 0) {
      await prisma.savedPost.deleteMany({
        where: { postId: id },
      });
    }

    // ✅ Delete post detail
    if (post.postDetail) {
      await prisma.postDetail.delete({
        where: { id: post.postDetail.id },
      });
    }

    // ✅ Finally delete the post
    await prisma.post.delete({
      where: { id },
    });

    res.status(200).json({ message: "Post deleted successfully." });
  } catch (err) {
    console.error("Admin failed to delete post:", err);
    res.status(500).json({ message: "Failed to delete post." });
  }
};

// ? admin update or edit any posts
export const adminUpdatePost = async (req, res) => {
    const { id } = req.params;
    const {
      title,
      price,
      images,
      address,
      city,
      bedroom,
      bathroom,
      latitude,
      longitude,
      type,
      property,
      postDetail,
    } = req.body;
  
    try {
      // ✅ Admin-only access check
      if (req.userRole !== "ADMIN") {
        return res.status(403).json({ message: "Unauthorized: Admin only." });
      }
  
      // ✅ Check if post exists
      const post = await prisma.post.findUnique({ where: { id } });
  
      if (!post) {
        return res.status(404).json({ message: "Post not found!" });
      }
  
      // ✅ Prepare update data (same as user function)
      const updatedData = {
        title,
        price,
        images,
        address,
        city,
        bedroom,
        bathroom,
        latitude,
        longitude,
        type,
        property,
        postDetail: postDetail ? { update: postDetail } : undefined,
      };
  
      // ✅ Remove undefined fields to avoid null overwrites
      Object.keys(updatedData).forEach((key) => {
        if (updatedData[key] === undefined) {
          delete updatedData[key];
        }
      });
  
      const updatedPost = await prisma.post.update({
        where: { id },
        data: updatedData,
        include: { postDetail: true },
      });
  
      res.status(200).json({
        message: "Post updated successfully by admin.",
        post: updatedPost,
      });
    } catch (err) {
      console.error("Admin failed to update post:", err);
      res.status(500).json({ message: "Failed to update post!" });
    }
  };
  