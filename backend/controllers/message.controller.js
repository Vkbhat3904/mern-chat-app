import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

// Helper function to convert mongoose document to plain object
const toPlainObject = (doc) => doc?.toObject?.() || doc;

export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    // Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    // Create new message
    const newMessage = new Message({
      senderId,
      receiverId,
      message,
    });

    if (newMessage) {
      conversation.messages.push(newMessage._id);
    }

    // Save both in parallel
    await Promise.all([conversation.save(), newMessage.save()]);

    // Convert to plain object for socket emission
    const plainMessage = toPlainObject(newMessage);

    // Emit to receiver if online
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", {
        ...plainMessage,
        shouldShake: true // Add shake effect for notification
      });
    }

    // Also emit to sender to update their UI
    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("newMessage", plainMessage);
    }

    res.status(201).json(plainMessage);
  } catch (error) {
    console.error("Error in sendMessage controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const senderId = req.user._id;

    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, userToChatId] },
    }).populate("messages");

    if (!conversation) return res.status(200).json([]);

    // Convert messages to plain objects
    const messages = conversation.messages.map(toPlainObject);
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    const message = await Message.findById(id);
    if (!message) return res.status(404).json({ error: "Message not found" });
    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Update message content and flag
    message.message = content;
    message.isEdited = true;
    await message.save();

    // Convert to plain object for socket emission
    const updatedMessage = toPlainObject(message);

    // Emit to both participants
    const receiverSocketId = getReceiverSocketId(message.receiverId);
    const senderSocketId = getReceiverSocketId(userId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageUpdated", updatedMessage);
    }
    if (senderSocketId) {
      io.to(senderSocketId).emit("messageUpdated", updatedMessage);
    }

    res.status(200).json(updatedMessage);
  } catch (error) {
    console.error("Update error:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

// Hard Delete Controller: deleteMessage.js
export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(id);
    if (!message) return res.status(404).json({ error: "Message not found" });

    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // ✅ 1. Remove message from the conversation.messages array
    await Conversation.updateOne(
      {
        participants: { $all: [message.senderId, message.receiverId] },
      },
      {
        $pull: { messages: message._id },
      }
    );

    // ✅ 2. Delete the message document itself
    await Message.findByIdAndDelete(id);

    // ✅ 3. Emit deletion event to update UI
    const deletedMessage = { _id: id };

    const receiverSocketId = getReceiverSocketId(message.receiverId);
    const senderSocketId = getReceiverSocketId(userId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageDeleted", deletedMessage);
    }
    if (senderSocketId) {
      io.to(senderSocketId).emit("messageDeleted", deletedMessage);
    }

    res.sendStatus(204);
  } catch (error) {
    console.error("Hard delete error:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};
