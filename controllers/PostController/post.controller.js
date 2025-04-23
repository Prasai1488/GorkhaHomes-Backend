import prisma from "../../lib/prisma.js";
import jwt from "jsonwebtoken";

//? Save a post
export const savePosts = async (req, res) => {
  try {
    const { postId } = req.body;
    const userId = req.userId; // Extract user ID from authentication middleware

    // Check if the post exists and is approved
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found!" });
    }

    if (post.status !== "APPROVED") {
      return res
        .status(403)
        .json({ message: "Only approved posts can be saved!" });
    }

    // Check if the post is already saved
    const existingSavedPost = await prisma.savedPost.findFirst({
      where: { postId, userId },
    });

    if (existingSavedPost) {
      return res.status(400).json({ message: "Post already saved!" });
    }

    // Save the post
    await prisma.savedPost.create({
      data: {
        postId,
        userId,
      },
    });

    res.status(200).json({ message: "Post saved successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save post!" });
  }
};

// ?Unsave a post
export const unsavePost = async (req, res) => {
  try {
    const { postId } = req.body;
    const userId = req.userId; // Extract user ID from authentication middleware

    // Check if the post is actually saved by the user
    const savedPost = await prisma.savedPost.findFirst({
      where: { postId, userId },
    });

    if (!savedPost) {
      return res.status(400).json({ message: "Post is not saved!" });
    }

    // Remove the saved post entry
    await prisma.savedPost.delete({
      where: { id: savedPost.id },
    });

    res.status(200).json({ message: "Post unsaved successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to unsave post!" });
  }
};

// ? Get a single approved post (publicly accessible)
export const getApprovedPostById = async (req, res) => {
  const id = req.params.id;

  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        postDetail: true,
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found!" });
    }

    if (post.status !== "APPROVED") {
      return res.status(403).json({ message: "Post is not public." });
    }

    // Optional: Check if user is logged in to include `isSaved`
    const token = req.cookies?.token;

    if (token) {
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);

        const saved = await prisma.savedPost.findUnique({
          where: {
            userId_postId: {
              postId: id,
              userId: payload.id,
            },
          },
        });

        return res.status(200).json({ ...post, isSaved: !!saved });
      } catch (err) {
        console.log("JWT verification failed", err);
        // Token invalid — return public version
      }
    }

    // Public view — user not logged in or token invalid
    return res.status(200).json({ ...post, isSaved: false });
  } catch (err) {
    console.error("Failed to get post", err);
    res.status(500).json({ message: "Failed to get post" });
  }
};

// ? filter posts
export const getPosts = async (req, res) => {
  const query = req.query;
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 5;
  const skip = (page - 1) * limit;

  const propertyStatusMap = {
    available: "Available",
    booked: "Booked",
    soldout: "SoldOut",
  };

  const propertyStatus = query.propertyStatus
    ? propertyStatusMap[query.propertyStatus.toLowerCase()]
    : undefined;

  const filters = {
    status: "APPROVED",
    ...(query.city && { city: query.city }),
    ...(query.type && { type: query.type }),
    ...(query.property && { property: query.property }),
    ...(query.bedroom && { bedroom: parseInt(query.bedroom) }),
    ...(propertyStatus && {
      postDetail: {
        propertyStatus: propertyStatus,
      },
    }),
  };

  // ✅ Fix: only apply price filter if values are non-zero
  const hasMinPrice = query.minPrice && query.minPrice !== "0";
  const hasMaxPrice = query.maxPrice && query.maxPrice !== "0";

  if (hasMinPrice || hasMaxPrice) {
    filters.price = {
      ...(hasMinPrice && { gte: parseInt(query.minPrice) }),
      ...(hasMaxPrice && { lte: parseInt(query.maxPrice) }),
    };
  }

  // console.log("📦 Filters used:", filters);

  try {
    const posts = await prisma.post.findMany({
      where: filters,
      skip,
      take: limit,
      include: {
        postDetail: true,
      },
    });

    const totalPosts = await prisma.post.count({
      where: filters,
    });

    res.status(200).json({
      posts,
      totalPages: Math.ceil(totalPosts / limit),
      currentPage: page,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get posts" });
  }
};
