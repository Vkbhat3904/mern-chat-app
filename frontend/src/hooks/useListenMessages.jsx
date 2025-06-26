import useConversation from "../zustand/useConversation";
import { useEffect } from "react";
import { useSocketContext } from "../context/SocketContext";

const useListenMessages = () => {
  const { socket } = useSocketContext();
  const { setMessages, updateMessage, deleteMessage } = useConversation();

  useEffect(() => {
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      setMessages((prevMessages) => {
        const alreadyExists = prevMessages.some(
          (msg) => msg._id === newMessage._id
        );
        if (alreadyExists) return prevMessages;
        return [...prevMessages, newMessage];
      });
    });

    socket.on("messageUpdated", (updatedMsg) => {
      updateMessage(updatedMsg);
    });

    socket.on("messageDeleted", (deleted) => {
      deleteMessage(deleted);
    });

    return () => {
      socket.off("newMessage");
      socket.off("messageUpdated");
      socket.off("messageDeleted");
    };
  }, [socket, setMessages, updateMessage, deleteMessage]);
};

export default useListenMessages;
