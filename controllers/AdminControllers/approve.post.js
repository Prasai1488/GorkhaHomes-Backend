import prisma from "../../lib/prisma.js";
import nodemailer from "nodemailer";

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




// ? Reject Post (Admin only)
export const rejectPost = async (req, res) => {
  try {
    const { postId } = req.body;
    const adminId = req.user.id; // Extract admin ID from authentication middleware

    // Ensure the user is an admin (Assuming role-based authentication)
    const adminUser = await prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!adminUser || adminUser.role !== "ADMIN") {
      return res.status(403).json({ message: "Unauthorized: Only admins can reject posts!" });
    }

    // Check if the post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { user: true }, // Fetch user details
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found!" });
    }

    if (post.status === "REJECTED") {
      return res.status(400).json({ message: "Post is already rejected!" });
    }

    // Update the post status to REJECTED
    await prisma.post.update({
      where: { id: postId },
      data: { status: "REJECTED" },
    });

    // Send rejection email to user
    await sendRejectionEmail(post.user.email, post.title);

    res.status(200).json({ message: "Post rejected successfully and email sent!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to reject post!" });
  }
};

// ? Function to send rejection email
const sendRejectionEmail = async (userEmail, postTitle) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_PASS, // Your email password or app password
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: "Your Post Has Been Rejected",
      text: `Dear User,\n\nWe regret to inform you that your post titled "${postTitle}" has been rejected by our moderators.\n\nIf you believe this was a mistake, please contact our support team.\n\nBest Regards,\nAdmin Team`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Rejection email sent to ${userEmail}`);
  } catch (error) {
    console.error("Error sending rejection email:", error);
  }
};
