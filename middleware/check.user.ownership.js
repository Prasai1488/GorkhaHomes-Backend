import prisma from "../lib/prisma.js";

export const checkUserOwnership = (req, res, next) => {
  const { id } = req.params;

  // If the authenticated user's ID doesn't match the requested ID, return error
  if (req.userId !== id) {
    return res
      .status(403)
      .json({ message: "You can only access your own data!" });
  }

  next();
};

export const checkUserPostOwnership = async (req, res, next) => {
  const { id } = req.params; // Post ID from the URL

  try {
    // Find the post by ID
    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found!" });
    }

    // Check if the post's userId matches the authenticated user's ID
    if (post.userId !== req.userId) {
      return res
        .status(403)
        .json({ message: "You can only access your own data!" });
    }

    next(); // Proceed if the user is the owner of the post
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error while checking ownership!" });
  }
};
