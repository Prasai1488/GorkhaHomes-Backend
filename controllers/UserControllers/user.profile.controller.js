import prisma from "../../lib/prisma.js";

//? get profile/user details
export const getUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    // Remove sensitive data like password before sending response
    const { password, ...userInfo } = user;

    // Send user data as a response
    res.status(200).json(userInfo);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to fetch user details!" });
  }
};
