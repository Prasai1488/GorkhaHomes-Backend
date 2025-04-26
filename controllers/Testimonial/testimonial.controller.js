import prisma from "../../lib/prisma.js";
import jwt from "jsonwebtoken";

// ? add testimonial without admin notification :
// export const addTestimonial = async (req, res) => {
//   const { rating, comment } = req.body;
//   const userId = req.userId;

//   if (rating < 1 || rating > 5) {
//     return res.status(400).json({ message: "Rating must be between 1 and 5" });
//   }

//   try {
//     // Check if the user has already submitted a testimonial
//     const existing = await prisma.testimonial.findUnique({
//       where: { userId },
//     });

//     if (existing) {
//       return res
//         .status(400)
//         .json({ message: "You have already submitted a testimonial" });
//     }

//     const newTestimonial = await prisma.testimonial.create({
//       data: {
//         userId,
//         rating,
//         comment,
//         status: "PENDING", // Default to pending
//       },
//     });

//     res.status(200).json({
//       message: "Testimonial submitted successfully",
//       data: newTestimonial,
//     });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ message: "Failed to create testimonial" });
//   }
// };



// ? add testimonial with admin notification
export const addTestimonial = async (req, res) => {
    const { rating, comment } = req.body;
    const userId = req.userId;
  
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }
  
    try {
      const existing = await prisma.testimonial.findUnique({ where: { userId } });
  
      if (existing) {
        return res.status(400).json({ message: "You have already submitted a testimonial" });
      }
  
      const newTestimonial = await prisma.testimonial.create({
        data: {
          userId,
          rating,
          comment,
          status: "PENDING",
        },
      });
  
      const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  
      if (admin) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            title: "New Testimonial Submitted",
            message: "A new testimonial is awaiting your review.",
            type: "TESTIMONIAL",
            entityId: newTestimonial.id,
          },
        });
      }
  
      res.status(200).json({
        message: "Testimonial submitted successfully",
        data: newTestimonial,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Failed to create testimonial" });
    }
  };
  

// ? get all testimonials
export const getApprovedTestimonials = async (req, res) => {
  const { page = 1, limit = 5 } = req.query;
  const skip = (page - 1) * limit;

  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { status: "APPROVED" },
      include: {
        user: {
          select: {
            username: true,
            avatar: true,
          },
        },
      },
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.testimonial.count({
      where: { status: "APPROVED" },
    });

    res.status(200).json({
      testimonials,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error fetching testimonials" });
  }
};

// ? delete testimonial
export const deleteTestimonial = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;

  try {
    const testimonial = await prisma.testimonial.findUnique({
      where: { id: id },
    });

    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    if (testimonial.userId !== tokenUserId) {
      return res.status(403).json({ message: "Not Authorized!" });
    }

    await prisma.testimonial.delete({
      where: { id: id },
    });

    res.status(200).json({ message: "Testimonial deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error deleting testimonial" });
  }
};
