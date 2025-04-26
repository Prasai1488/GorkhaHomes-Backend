import prisma from "../../lib/prisma.js";

export const getAdminNotifications = async (req, res) => {
  try {
    if (req.userRole !== "ADMIN") {
      return res.status(403).json({ message: "Access denied: Admins only." });
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId: req.userId, // Logged-in admin user
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({ data: notifications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

export const markNotificationAsRead = async (req, res) => {
  const { id } = req.params;

  try {
    if (req.userRole !== "ADMIN") {
      return res.status(403).json({ message: "Access denied: Admins only." });
    }

    await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    res.status(200).json({ message: "Notification marked as read." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to mark notification as read." });
  }
};
