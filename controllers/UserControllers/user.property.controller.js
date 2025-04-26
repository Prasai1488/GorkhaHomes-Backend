import prisma from "../../lib/prisma.js";

// ? create post without admin getting notification function
// export const createPost = async (req, res) => {
//   const body = req.body;

//   const {
//     title,
//     price,
//     images,
//     address,
//     city,
//     bedroom,
//     bathroom,
//     latitude,
//     longitude,
//     type,
//     property,
//     postDetail,
//   } = body;
//   const userId = req.userId;

//   try {
//     const newPost = await prisma.post.create({
//       data: {
//         title,
//         price,
//         images,
//         address,
//         city,
//         bedroom,
//         bathroom,
//         latitude,
//         longitude,
//         type,
//         property,
//         userId,
//         postDetail: postDetail
//           ? { create: postDetail } // If postDetail is provided, create a PostDetail record
//           : undefined, // If not provided, postDetail will not be created
//       },
//     });

//     res
//       .status(201)
//       .json({ message: "Post created successfully!", post: newPost });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ message: "Failed to create post!" });
//   }
// };

// ? create post with admin getting notification function
export const createPost = async (req, res) => {
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
  const userId = req.userId;

  try {
    const newPost = await prisma.post.create({
      data: {
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
        userId,
        postDetail: postDetail ? { create: postDetail } : undefined,
      },
    });

    const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });

    if (admin) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          title: "New Post Pending Approval",
          message: `Post titled "${title}" requires admin review.`,
          type: "POST",
          entityId: newPost.id,
        },
      });
    }

    res
      .status(201)
      .json({ message: "Post created successfully!", post: newPost });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to create post!" });
  }
};

// ? update post details by id
export const updatePost = async (req, res) => {
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
    // Find the post by ID
    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found!" });
    }

    // Check if the post is approved
    if (post.status !== "APPROVED") {
      return res
        .status(400)
        .json({ message: "Post must be approved before updating." });
    }

    // Prepare the data object
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

    // Remove undefined fields
    Object.keys(updatedData).forEach((key) => {
      if (updatedData[key] === undefined) {
        delete updatedData[key];
      }
    });

    // Proceed with the update
    const updatedPost = await prisma.post.update({
      where: { id },
      data: updatedData, // Use filtered data
    });

    res.status(200).json(updatedPost);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to update post!" });
  }
};

// ? get pending posts
export const getPendingPosts = async (req, res) => {
  const userId = req.userId;
  try {
    const pendingPosts = await prisma.post.findMany({
      where: { status: "PENDING", userId: userId },
    });

    res.status(200).json(pendingPosts);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to fetch pending posts!" });
  }
};

// ? get rejected posts
export const getRejectedPosts = async (req, res) => {
  const userId = req.userId;
  try {
    const rejectedPosts = await prisma.post.findMany({
      where: { status: "REJECTED", userId: userId },
    });

    res.status(200).json(rejectedPosts);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to fetch rejected posts!" });
  }
};

// ? get approved posts
export const getApprovedPosts = async (req, res) => {
  const userId = req.userId;
  try {
    const approvedPosts = await prisma.post.findMany({
      where: { status: "APPROVED", userId: userId },
    });

    res.status(200).json(approvedPosts);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to fetch approved posts!" });
  }
};

// ? save or unsave post :
export const savePost = async (req, res) => {
  const postId = req.body.postId;
  const tokenUserId = req.userId;

  try {
    const savedPost = await prisma.savedPost.findUnique({
      where: {
        userId_postId: {
          userId: tokenUserId,
          postId,
        },
      },
    });

    if (savedPost) {
      await prisma.savedPost.delete({
        where: {
          id: savedPost.id,
        },
      });
      res.status(200).json({ message: "Post removed from saved list" });
    } else {
      await prisma.savedPost.create({
        data: {
          userId: tokenUserId,
          postId,
        },
      });
      res.status(200).json({ message: "Post saved" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed save post!" });
  }
};

// ? delete post :
export const deletePost = async (req, res) => {
  const id = req.params.id;

  try {
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
