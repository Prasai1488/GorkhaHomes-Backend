import prisma from "../../lib/prisma.js";

//? get profile details of specific user by id
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


// ? update user profile details by id
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { email, username, password, fullName, phoneNumber, avatar } = req.body;

  try {
    // Check if the user exists
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    // Check if email or username is already taken (excluding the current user)
    if (email) {
      const existingEmail = await prisma.user.findUnique({ where: { email } });
      if (existingEmail && existingEmail.id !== id) {
        return res.status(400).json({ message: "Email is already in use!" });
      }
    }

    if (username) {
      const existingUsername = await prisma.user.findUnique({ where: { username } });
      if (existingUsername && existingUsername.id !== id) {
        return res.status(400).json({ message: "Username is already taken!" });
      }
    }

    // Prepare data to be updated
    const updatedData = { email, username, fullName, phoneNumber, avatar };

    // Hash password if provided
    if (password) {
      updatedData.password = await bcrypt.hash(password, 10);
    }

    // Remove undefined fields
    Object.keys(updatedData).forEach((key) => {
      if (updatedData[key] === undefined) {
        delete updatedData[key];
      }
    });

    // Update user in the database
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updatedData,
    });

    // Exclude password before sending response
    const { password: _, ...userInfo } = updatedUser;

    res.status(200).json(userInfo);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to update user details!" });
  }
};
