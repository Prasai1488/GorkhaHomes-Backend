import prisma from "../../lib/prisma.js";
import jwt from "jsonwebtoken";

// api to get all users
export const getUsers = async (req, res) => {
  try {
    // get users from database
    const users = await prisma.user.findMany();
    // return users
    res.status(200).json(users);
  } catch (err) {
    // handle error
    console.log(err);
    res.status(500).json({ message: "Failed to get users!" });
  }
};



// get current user
export const getCurrentUser = async (req, res) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (err) {
    console.error("Failed to get current user:", err);
    return res.status(401).json({ message: "Invalid token" });
  }
};
