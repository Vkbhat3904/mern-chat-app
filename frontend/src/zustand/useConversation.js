import { create } from "zustand";
import { socket } from "../socket/socket";


const useConversation = create((set, get) => ({
  // Conversation state
  selectedConversation: null,
  setSelectedConversation: (selectedConversation) => set({ selectedConversation }),

  // Messages state with immutability handling
  messages: [],
  setMessages: (messages) => set((state) => ({
    messages:
      typeof messages === "function"
        ? [...messages(state.messages)]
        : Array.isArray(messages)
        ? [...messages]
        : []
  })),

  // Update a message immutably
  updateMessage: (updatedMessage) => set((state) => ({
    messages: state.messages.map((msg) =>
      msg._id === updatedMessage._id
        ? { ...msg, ...updatedMessage, updatedAt: new Date().toISOString() }
        : msg
    )
  })),

  // Delete a message by ID (hard delete)
  deleteMessage: (deletedMessage) =>
    set((state) => ({
      messages: state.messages.filter((msg) => msg._id !== deletedMessage._id)
    })),

  // Add new message to top
  addNewMessage: (newMessage) => set((state) => ({
    messages: [newMessage, ...state.messages]
  })),

  // Clear all messages
  clearMessages: () => set({ messages: [] })
}));

// ✅ Setup Socket Listeners (Singleton-safe):
// This runs once and listens for events. Place this in the same file or your socket initializer.
if (typeof window !== "undefined" && socket && !socket._listenersRegistered) {
  socket.on("messageUpdated", (updatedMessage) => {
    useConversation.getState().updateMessage(updatedMessage);
  });

  socket.on("messageDeleted", (deletedMessage) => {
    useConversation.getState().deleteMessage(deletedMessage);
  });

  socket.on("newMessage", (newMessage) => {
    useConversation.getState().addNewMessage(newMessage);
  });

  socket._listenersRegistered = true; // Prevent duplicate listeners
}

export default useConversation;
