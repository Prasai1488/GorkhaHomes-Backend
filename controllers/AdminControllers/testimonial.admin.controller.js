import prisma from "../../lib/prisma.js";
import nodemailer from "nodemailer";

export const getTestimonialsByStatus = async (req, res) => {
  const { status } = req.query;

  try {
    if (req.userRole !== "ADMIN") {
      return res.status(403).json({ message: "Access denied: Admins only." });
    }

    const testimonials = await prisma.testimonial.findMany({
      where: { status },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({ data: testimonials });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch testimonials." });
  }
};

export const approveTestimonial = async (req, res) => {
  const { id } = req.params;

  try {
    const testimonial = await prisma.testimonial.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found!" });
    }

    if (req.userRole !== "ADMIN") {
      return res.status(403).json({ message: "Access denied: Admins only." });
    }

    if (testimonial.status !== "PENDING") {
      return res
        .status(400)
        .json({ message: "Only pending testimonials can be approved." });
    }

    const updated = await prisma.testimonial.update({
      where: { id },
      data: { status: "APPROVED" },
    });

    if (testimonial.user?.email) {
      await sendTestimonialApprovalEmail(testimonial.user.email);
    }

    res.status(200).json({
      message: "Testimonial approved and email sent!",
      testimonial: updated,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to approve testimonial." });
  }
};

export const rejectTestimonial = async (req, res) => {
  const { id } = req.params;

  try {
    const testimonial = await prisma.testimonial.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found!" });
    }

    if (req.userRole !== "ADMIN") {
      return res.status(403).json({ message: "Access denied: Admins only." });
    }

    if (testimonial.status !== "PENDING") {
      return res
        .status(400)
        .json({ message: "Only pending testimonials can be rejected." });
    }

    const updated = await prisma.testimonial.update({
      where: { id },
      data: { status: "REJECTED" },
    });

    if (testimonial.user?.email) {
      await sendTestimonialRejectionEmail(testimonial.user.email);
    }

    res.status(200).json({
      message: "Testimonial rejected and email sent!",
      testimonial: updated,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to reject testimonial." });
  }
};

// ? approval email function
const sendTestimonialApprovalEmail = async (email) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your Testimonial Has Been Approved",
    text: `Hi there,\n\nThank you for your feedback! Your testimonial has been approved and is now visible on our platform.\n\nWarm regards,\nThe Team`,
  };

  await transporter.sendMail(mailOptions);
};

//   ? rejection email function
const sendTestimonialRejectionEmail = async (email) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your Testimonial Has Been Rejected",
    text: `Hi there,\n\nWe appreciate your effort, but your testimonial did not meet our publishing criteria and has been rejected.\n\nIf you believe this was an error, please contact support.\n\nWarm regards,\nThe Team`,
  };

  await transporter.sendMail(mailOptions);
};
