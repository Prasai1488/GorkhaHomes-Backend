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



// ? update post details by id
export const updatePost = async (req, res) => {
    const { id } = req.params;
    const { title, price, images, address, city, bedroom, bathroom, latitude, longitude, type, property, postDetail } = req.body;
  
    try {
        // Find the post by ID
        const post = await prisma.post.findUnique({
            where: { id },
        });

        if (!post) {
            return res.status(404).json({ message: "Post not found!" });
        }

        // Check if the post is approved
        if (!post.approved) {
            return res.status(400).json({ message: "Post must be approved before updating." });
        }

        // Prepare the data object
        const updatedData = {
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
            postDetail: postDetail ? { update: postDetail } : undefined,
        };

        // Remove undefined fields
        Object.keys(updatedData).forEach((key) => {
            if (updatedData[key] === undefined) {
                delete updatedData[key];
            }
        });

        // Proceed with the update
        const updatedPost = await prisma.post.update({
            where: { id },
            data: updatedData, // Use filtered data
        });

        res.status(200).json(updatedPost);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Failed to update post!" });
    }
};




// ? get specific post by id
export const getPost = async (req, res) => {
  const { id } = req.params;

  try {
    const post = await prisma.post.findUnique({
      where: {
        id: id,
      },
      include: {
        postDetail: true,
      },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found!" });
    }

    res.status(200).json(post);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to fetch post details!" });
  }
}