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

    if (req.userRole !== "ADMIN") {
      return res
        .status(403)
        .json({ message: "You don't have permission to approve this post." });
    }

    if (post.status !== "PENDING") {
      return res
        .status(400)
        .json({ message: "Only pending posts can be approved." });
    }

    // Update the post's approval status to "APPROVED"
    const updatedPost = await prisma.post.update({
      where: { id: id },
      data: { status: "APPROVED" },
    });

    res
      .status(200)
      .json({ message: "Post approved successfully!", post: updatedPost });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to approve post!" });
  }
};

// ? Reject Post (Admin only)
export const rejectPost = async (req, res) => {
  const { id } = req.params;

  try {
    const post = await prisma.post.findUnique({
      where: { id: id },
      include: { user: true }, // ✅ Include user details (email)
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found!" });
    }

    if (req.userRole !== "ADMIN") {
      return res
        .status(403)
        .json({ message: "You don't have permission to reject this post." });
    }

    if (post.status !== "PENDING") {
      return res
        .status(400)
        .json({ message: "Only pending posts can be rejected." });
    }

    // Update the post status to REJECTED
    await prisma.post.update({
      where: { id: id },
      data: { status: "REJECTED" },
    });

    // ✅ Ensure we have the user's email
    if (!post.user || !post.user.email) {
      return res.status(500).json({ message: "User email not found!" });
    }

    // Send rejection email to user
    await sendRejectionEmail(post.user.email, post.title);

    res
      .status(200)
      .json({ message: "Post rejected successfully and email sent!" });
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
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS, 
      },
      tls: {
        rejectUnauthorized: false, // ✅ Allows self-signed certificates
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
