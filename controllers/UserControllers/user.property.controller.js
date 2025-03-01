import prisma from "../../lib/prisma.js";

export const createPost = async (req, res) => {
  const body = req.body;

  const {
    title,
    price,
    images,
    address,
    city,
    bedroom,
    bathroom,
    latitude,
    longitude,
    type,
    property,
    postDetail,
  } = body;
  const userId = req.userId;

  try {
    const newPost = await prisma.post.create({
      data: {
        title,
        price,
        images,
        address,
        city,
        bedroom,
        bathroom,
        latitude,
        longitude,
        type,
        property,
        userId,
        postDetail: postDetail
          ? { create: postDetail } // If postDetail is provided, create a PostDetail record
          : undefined, // If not provided, postDetail will not be created
      },
    });

    res
      .status(201)
      .json({ message: "Post created successfully!", post: newPost });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to create post!" });
  }
};
