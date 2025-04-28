import prisma from "../../lib/prisma.js";

export const getRecommendations = async (req, res) => {
  const userId = req.userId;

  try {
    // 1. Get saved posts of the user
    const savedPosts = await prisma.savedPost.findMany({
      where: { userId },
      include: { post: true },
    });

    if (savedPosts.length === 0) {
      return res.status(200).json({ recommendations: [] });
    }

    // 2. Collect property types and cities from saved posts
    const propertyTypes = [
      ...new Set(savedPosts.map((sp) => sp.post.property)),
    ];
    const cities = [...new Set(savedPosts.map((sp) => sp.post.city))];

    // 3. Find recommended posts based on matched property types and cities
    const recommendations = await prisma.post.findMany({
      where: {
        AND: [
          {
            status: "APPROVED",
          },
          {
            property: { in: propertyTypes },
          },
          {
            city: { in: cities },
          },
          {
            userId: { not: userId }, // Exclude posts created by the current user
          },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
      include: {
        postDetail: true, // ✅ Add this line
      },
    });

    res.status(200).json({ recommendations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get recommendations!" });
  }
};
