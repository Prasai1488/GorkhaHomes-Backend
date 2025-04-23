import prisma from "../../lib/prisma.js";

// Function to add a message to a chat
export const addMessage = async (req, res) => {
 
  const tokenUserId = req.userId;
 
  const chatId = req.params.chatId;

  const text = req.body.text;

  try {
    
    const chat = await prisma.chat.findUnique({
      where: {
        id: chatId,
        userIDs: {
          hasSome: [tokenUserId], 
        },
      },
    });

   
    if (!chat) return res.status(404).json({ message: "Chat not found!" });

   
    const message = await prisma.message.create({
      data: {
        text, // Message text
        chatId, // Chat ID
        userId: tokenUserId, // User ID of the sender
      },
    });

   
    await prisma.chat.update({
      where: {
        id: chatId,
      },
      data: {
        seenBy: [tokenUserId], // Marking the chat as seen by the sender
        lastMessage: text, // Updating the last message in the chat
      },
    });

   
    res.status(200).json(message);
  } catch (err) {

    console.log(err);
    res.status(500).json({ message: "Failed to add message!" });
  }
};
