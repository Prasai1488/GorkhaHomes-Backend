import prisma from "../../lib/prisma.js";
// Save a post 
export const savePost = async (req, res) => {
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
        return res.status(403).json({ message: "Only approved posts can be saved!" });
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
  
  // Unsave a post
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
  