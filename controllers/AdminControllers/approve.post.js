import prisma from "../../lib/prisma.js";

//? Controller to approve a post
export const approvePost = async (req, res) => {
  const { id } = req.params;

  try {
  
    const post = await prisma.post.findUnique({
      where: { id: id },
    });


    if (!post) {
      return res.status(404).json({ message: "Post not found!" });
    }

    if (req.userRole !== 'ADMIN') {
      return res.status(403).json({ message: "You don't have permission to approve this post." });
    }

    // Update the post's approval status to true
    const updatedPost = await prisma.post.update({
      where: { id: id },
      data: { status: "APPROVED" },
    });

    res.status(200).json({ message: "Post approved successfully!", post: updatedPost });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to approve post!" });
  }
};
